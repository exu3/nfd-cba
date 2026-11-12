// =====================================================================
//  The math. Pure functions only — no React — so you can test it with
//  `npm run test:model` and change it without touching the UI.
// =====================================================================

/** Present-value factor for a cost in year t. */
export const pv = (t, r) => 1 / Math.pow(1 + r, t);

/** PV of $1/yr paid in years a..b inclusive. */
export function pvRange(a, b, r) {
  let s = 0;
  for (let t = a; t <= b; t++) s += pv(t, r);
  return s;
}

/** Hazard parameters after an alternative's effects are applied. */
export function adjustedHazard(hazard, alt) {
  const e = alt.effects?.[hazard.id] ?? {};
  const lf = e.likelihoodFactor ?? 1;
  const cf = e.consequenceFactor ?? 1;
  return {
    ...hazard,
    p: Math.min(1, Math.max(0, hazard.annualProbability * lf)),
    oneTime: hazard.oneTimeCost * cf,
    after: hazard.annualCostAfter,
  };
}

/**
 * Expected present value of a hazard's costs over the horizon (exact, no randomness).
 * Non-repeatable: P(first event in year t) = (1-p)^(t-1) * p, then pay ongoing costs to year N.
 * Repeatable: each year independently has probability p.
 */
export function expectedHazardPV(h, N, r) {
  let total = 0;
  for (let t = 1; t <= N; t++) {
    if (h.repeatable) {
      // each event's own follow-on costs also counted
      total += h.p * (h.oneTime * pv(t, r) + h.after * pvRange(t + 1, N, r));
    } else {
      const pFirst = Math.pow(1 - h.p, t - 1) * h.p;
      total += pFirst * (h.oneTime * pv(t, r) + h.after * pvRange(t + 1, N, r));
    }
  }
  return total;
}

/** PV of the alternative's own (certain) costs. */
export function alternativeCostPV(alt, N, r) {
  return alt.capitalCost + alt.annualOM * pvRange(1, N, r);
}

/** Probability the hazard happens at least once during the horizon. */
export function probAtLeastOnce(h, N) {
  return 1 - Math.pow(1 - h.p, N);
}

/** Deterministic expected-value results for one alternative. */
export function evaluateAlternative(alt, hazards, settings) {
  const { horizonYears: N, discountRate: r } = settings;
  const adj = hazards.map((h) => adjustedHazard(h, alt));
  const byHazard = adj.map((h) => ({
    id: h.id,
    name: h.name,
    expectedPV: expectedHazardPV(h, N, r),
    probAtLeastOnce: probAtLeastOnce(h, N),
  }));
  const riskPV = byHazard.reduce((s, x) => s + x.expectedPV, 0);
  const ownPV = alternativeCostPV(alt, N, r);
  return { id: alt.id, name: alt.name, ownPV, riskPV, totalPV: ownPV + riskPV, byHazard };
}

/** Simple seeded RNG so results don't jitter every time you type. */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Monte Carlo: simulate many 30-year futures, return the spread of total PV cost. */
export function monteCarlo(alt, hazards, settings, seed = 42) {
  const { horizonYears: N, discountRate: r, monteCarloRuns: runs } = settings;
  const rand = mulberry32(seed);
  const adj = hazards.map((h) => adjustedHazard(h, alt));
  const own = alternativeCostPV(alt, N, r);
  const totals = new Float64Array(runs);
  let runsWithEvent = 0;

  for (let i = 0; i < runs; i++) {
    let cost = own;
    let anyEvent = false;
    for (const h of adj) {
      let happened = false;
      for (let t = 1; t <= N; t++) {
        if (!h.repeatable && happened) break;
        if (rand() < h.p) {
          happened = true;
          anyEvent = true;
          cost += h.oneTime * pv(t, r) + h.after * pvRange(t + 1, N, r);
        }
      }
    }
    totals[i] = cost;
    if (anyEvent) runsWithEvent++;
  }

  totals.sort();
  const q = (f) => totals[Math.min(runs - 1, Math.floor(f * runs))];
  const mean = totals.reduce((s, x) => s + x, 0) / runs;
  return { mean, p10: q(0.1), p50: q(0.5), p90: q(0.9), max: totals[runs - 1], probAnyEvent: runsWithEvent / runs };
}

/** Run everything and compute benefit-cost vs. the baseline. */
export function runAnalysis({ settings, hazards, alternatives, baselineId }) {
  const results = alternatives.map((alt, i) => ({
    ...evaluateAlternative(alt, hazards, settings),
    mc: monteCarlo(alt, hazards, settings, 1000 + i),
  }));
  const base = results.find((x) => x.id === baselineId) ?? results[0];

  return results.map((x) => {
    const benefit = base.riskPV - x.riskPV;          // avoided expected damages
    const extraCost = x.ownPV - base.ownPV;          // what the alternative costs
    return {
      ...x,
      benefit,
      extraCost,
      netBenefit: benefit - extraCost,
      bcRatio: extraCost > 0 ? benefit / extraCost : null,
    };
  });
}
