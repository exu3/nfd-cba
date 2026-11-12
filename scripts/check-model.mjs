// Sanity check for the math: `npm run test:model`
// Confirms the exact expected value and the Monte Carlo mean agree,
// and prints a quick results table from the defaults.
import { DEFAULT_SETTINGS, DEFAULT_HAZARDS, DEFAULT_ALTERNATIVES, BASELINE_ID } from "../lib/assumptions.js";
import { runAnalysis } from "../lib/model.js";

const settings = { ...DEFAULT_SETTINGS, monteCarloRuns: 200_000 };
const res = runAnalysis({ settings, hazards: DEFAULT_HAZARDS, alternatives: DEFAULT_ALTERNATIVES, baselineId: BASELINE_ID });

console.table(
  res.map((r) => ({
    alternative: r.name,
    totalPV: Math.round(r.totalPV),
    mcMean: Math.round(r.mc.mean),
    diffPct: (((r.mc.mean - r.totalPV) / r.totalPV) * 100).toFixed(2) + "%",
    netBenefit: Math.round(r.netBenefit),
    bc: r.bcRatio?.toFixed(2) ?? "—",
  }))
);

const worst = Math.max(...res.map((r) => Math.abs(r.mc.mean - r.totalPV) / r.totalPV));
if (worst > 0.02) {
  console.error("FAIL: Monte Carlo mean differs from expected value by >2%");
  process.exit(1);
}
console.log("OK: Monte Carlo agrees with the exact expected value.");
