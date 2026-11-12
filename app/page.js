"use client";
import { useMemo, useState } from "react";
import { DEFAULT_SETTINGS, DEFAULT_HAZARDS, DEFAULT_ALTERNATIVES, BASELINE_ID } from "../lib/assumptions";
import { runAnalysis } from "../lib/model";
import { NumberField, fmtMoney, fmtPct } from "../components/Inputs";
import CostChart from "../components/CostChart";
import RangeChart from "../components/RangeChart";

const clone = (x) => JSON.parse(JSON.stringify(x));

export default function Home() {
  const [settings, setSettings] = useState(clone(DEFAULT_SETTINGS));
  const [hazards, setHazards] = useState(clone(DEFAULT_HAZARDS));
  const [alts, setAlts] = useState(clone(DEFAULT_ALTERNATIVES));

  const results = useMemo(
    () => runAnalysis({ settings, hazards, alternatives: alts, baselineId: BASELINE_ID }),
    [settings, hazards, alts]
  );

  // --- updaters -------------------------------------------------------
  const setS = (k) => (v) => setSettings((s) => ({ ...s, [k]: v }));
  const setH = (i, k) => (v) => setHazards((hs) => hs.map((h, j) => (j === i ? { ...h, [k]: v } : h)));
  const setA = (i, k) => (v) => setAlts((as) => as.map((a, j) => (j === i ? { ...a, [k]: v } : a)));
  const setEffect = (i, hid, k) => (v) =>
    setAlts((as) =>
      as.map((a, j) =>
        j === i ? { ...a, effects: { ...a.effects, [hid]: { ...(a.effects[hid] ?? {}), [k]: v } } } : a
      )
    );

  const reset = () => {
    setSettings(clone(DEFAULT_SETTINGS));
    setHazards(clone(DEFAULT_HAZARDS));
    setAlts(clone(DEFAULT_ALTERNATIVES));
  };
  const exportScenario = () => {
    const blob = new Blob([JSON.stringify({ settings, hazards, alternatives: alts }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nfd-scenario.json";
    a.click();
  };

  const best = [...results].sort((a, b) => a.totalPV - b.totalPV)[0];

  return (
    <main>
      <header>
        <h1>Norwich Fire District — Source Protection Cost/Benefit</h1>
        <p className="sub">
          Risk-weighted, {settings.horizonYears}-year present-value comparison of protection alternatives.
          Screening-level: all defaults are placeholders until replaced with team estimates.
        </p>
        <div className="actions">
          <button onClick={reset}>Reset to defaults</button>
          <button onClick={exportScenario}>Download scenario (.json)</button>
        </div>
      </header>

      {/* ================= RESULTS ================= */}
      <section>
        <h2>Results</h2>
        <div className="hero">
          <div>
            <span className="hero-label">Lowest expected total cost</span>
            <span className="hero-value">{best.name}</span>
            <span className="hero-sub">{fmtMoney(best.totalPV)} present value</span>
          </div>
        </div>

        <h3>Expected total cost (lower is better)</h3>
        <CostChart results={results} />

        <h3>Range of outcomes (Monte Carlo, {settings.monteCarloRuns.toLocaleString()} runs)</h3>
        <RangeChart results={results} />

        <h3>Table</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Alternative</th>
                <th>Alt. cost (PV)</th>
                <th>Expected event cost (PV)</th>
                <th>Expected total (PV)</th>
                <th>Benefit vs. do nothing</th>
                <th>Net benefit</th>
                <th>B/C ratio</th>
                {hazards.map((h) => <th key={h.id}>P({h.id}) in {settings.horizonYears} yr</th>)}
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{fmtMoney(r.ownPV)}</td>
                  <td>{fmtMoney(r.riskPV)}</td>
                  <td><strong>{fmtMoney(r.totalPV)}</strong></td>
                  <td>{fmtMoney(r.benefit)}</td>
                  <td>{fmtMoney(r.netBenefit)}</td>
                  <td>{r.bcRatio == null ? "—" : r.bcRatio.toFixed(2)}</td>
                  {r.byHazard.map((h) => <td key={h.id}>{fmtPct(h.probAtLeastOnce)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">
          Benefit = expected event cost avoided compared with “Do nothing.” B/C &gt; 1 means the alternative
          pays for itself in avoided expected damages.
        </p>
      </section>

      {/* ================= INPUTS ================= */}
      <section>
        <h2>Global settings</h2>
        <div className="grid3">
          <NumberField label="Horizon (years)" value={settings.horizonYears} onChange={setS("horizonYears")} />
          <NumberField label="Real discount rate" kind="percent" value={settings.discountRate} onChange={setS("discountRate")} />
          <NumberField label="Monte Carlo runs" value={settings.monteCarloRuns} step={1000} onChange={setS("monteCarloRuns")} />
        </div>
      </section>

      <section>
        <h2>Hazards (what could go wrong)</h2>
        <div className="cards">
          {hazards.map((h, i) => (
            <div className="card" key={h.id}>
              <h3>{h.name}</h3>
              <p className="note">{h.notes}</p>
              <NumberField label="Annual probability" kind="percent" step={0.1} value={h.annualProbability} onChange={setH(i, "annualProbability")} />
              <NumberField label="One-time cost if it happens" kind="money" value={h.oneTimeCost} onChange={setH(i, "oneTimeCost")} />
              <NumberField label="Annual cost afterward" kind="money" value={h.annualCostAfter} onChange={setH(i, "annualCostAfter")} />
              <label className="check">
                <input type="checkbox" checked={h.repeatable} onChange={(e) => setH(i, "repeatable")(e.target.checked)} />
                Can happen more than once
              </label>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Alternatives</h2>
        <div className="cards">
          {alts.map((a, i) => (
            <div className="card" key={a.id}>
              <h3>{a.name}</h3>
              <p className="note">{a.notes}</p>
              <NumberField label="Capital cost to District" kind="money" value={a.capitalCost} onChange={setA(i, "capitalCost")} />
              <NumberField label="Annual O&M" kind="money" value={a.annualOM} onChange={setA(i, "annualOM")} />
              {hazards.map((h) => (
                <fieldset key={h.id}>
                  <legend>Effect on: {h.name}</legend>
                  <NumberField
                    label="Likelihood ×" step={0.05}
                    value={a.effects[h.id]?.likelihoodFactor ?? 1}
                    onChange={setEffect(i, h.id, "likelihoodFactor")}
                    hint="1 = no change, 0.5 = half as likely"
                  />
                  <NumberField
                    label="One-time consequence ×" step={0.05}
                    value={a.effects[h.id]?.consequenceFactor ?? 1}
                    onChange={setEffect(i, h.id, "consequenceFactor")}
                    hint="e.g. early warning lowers emergency cost"
                  />
                </fieldset>
              ))}
            </div>
          ))}
        </div>
      </section>

      <footer className="note">
        Method: expected present value of each hazard = Σ over years of P(event in year t) × discounted
        one-time cost + discounted ongoing costs to end of horizon. Non-repeatable hazards (PFAS) occur at most
        once. Monte Carlo samples the same model to show the spread. See <code>lib/model.js</code>.
      </footer>
    </main>
  );
}
