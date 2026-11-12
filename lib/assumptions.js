// =====================================================================
//  ALL THE NUMBERS LIVE HERE.
//  Every value below is a PLACEHOLDER — replace with your team's
//  estimates and write the source next to each one (quote, report, etc.).
//  Everything can also be edited live in the browser; these are just
//  the defaults the app loads with ("Reset to defaults" returns here).
//
//  Units: dollars are in today's dollars (real), rates are decimals
//  (0.03 = 3%), probabilities are per-year (0.01 = 1% chance each year).
// =====================================================================

export const DEFAULT_SETTINGS = {
  horizonYears: 30,          // analysis period
  discountRate: 0.03,        // REAL discount rate (inflation removed)
  monteCarloRuns: 5000,      // simulated futures per alternative
};

// ---------------------------------------------------------------------
// HAZARDS — things that can go wrong and what they cost if they do.
//
// repeatable: false  -> once it happens, it has happened (PFAS reaching
//                       the source is permanent: you treat forever after)
// repeatable: true   -> can happen more than once (e.g. separate spills)
//
// oneTimeCost     — paid in the year the event happens
//                   (treatment install, emergency response, sampling…)
// annualCostAfter — paid every year AFTER the event until end of horizon
//                   (e.g. GAC media change-outs, extra PFAS sampling)
// ---------------------------------------------------------------------
export const DEFAULT_HAZARDS = [
  {
    id: "pfas",
    name: "PFAS reaches the well (gravel pit source)",
    annualProbability: 0.02,   // PLACEHOLDER
    repeatable: false,
    oneTimeCost: 1_500_000,    // PLACEHOLDER: GAC vessels, building, piping, design, interim response
    annualCostAfter: 60_000,   // PLACEHOLDER: GAC media replacement + compliance sampling
    notes: "Treatment would likely be granular activated carbon (GAC). Replacement well not feasible.",
  },
  {
    id: "rail",
    name: "Emergency event: rail spill",
    annualProbability: 0.002,  // PLACEHOLDER
    repeatable: true,
    oneTimeCost: 400_000,      // PLACEHOLDER: emergency response, temporary water, sampling, cleanup share
    annualCostAfter: 0,
    notes: "Low-probability / high-consequence. Adjust if the rail line is outside the SPA.",
  },
];

// ---------------------------------------------------------------------
// ALTERNATIVES
//
// capitalCost  — up-front cost to the District in year 0
// annualOM     — yearly cost to the District (sampling, upkeep, stewardship)
// effects[hazardId]:
//   likelihoodFactor   multiplies the hazard's annual probability
//                      (1 = no change, 0.5 = halves it, 0 = eliminates it)
//   consequenceFactor  multiplies the hazard's ONE-TIME cost
//                      (early warning can shrink emergency costs even if
//                       treatment is still eventually needed)
// Any hazard not listed under effects defaults to factors of 1.
// ---------------------------------------------------------------------
export const DEFAULT_ALTERNATIVES = [
  {
    id: "nothing",
    name: "1. Do nothing",
    capitalCost: 0,
    annualOM: 0,
    effects: {},
    notes: "Baseline. Every other alternative is compared to this.",
  },
  {
    id: "barrier",
    name: "2. Impervious slab / barrier (excavator buys pit)",
    capitalCost: 250_000,      // PLACEHOLDER: District's share, if any
    annualOM: 5_000,           // PLACEHOLDER: inspection / maintenance
    effects: {
      pfas: { likelihoodFactor: 0.5, consequenceFactor: 1.0 },
      rail: { likelihoodFactor: 1.0, consequenceFactor: 1.0 },
    },
    notes: "Reduces infiltration from stored materials; depends on owner upkeep.",
  },
  {
    id: "monitoring",
    name: "3. Monitoring wells on gravel pit (recommended)",
    capitalCost: 120_000,      // PLACEHOLDER: drilling + install of sentinel wells
    annualOM: 15_000,          // PLACEHOLDER: quarterly PFAS sampling + lab
    effects: {
      pfas: { likelihoodFactor: 0.8, consequenceFactor: 0.6 },
      rail: { likelihoodFactor: 1.0, consequenceFactor: 0.8 },
    },
    notes: "Early warning: time to install treatment / act on the source before customers are exposed.",
  },
  {
    id: "conserve",
    name: "4. Buy & conserve land (e.g. with UVLT)",
    capitalCost: 900_000,      // PLACEHOLDER: purchase price minus grants / land trust share
    annualOM: 3_000,           // PLACEHOLDER: stewardship
    effects: {
      pfas: { likelihoodFactor: 0.1, consequenceFactor: 1.0 },
      rail: { likelihoodFactor: 1.0, consequenceFactor: 1.0 },
    },
    notes: "Removes the gravel-pit source. Does not affect the rail corridor.",
  },
];

export const BASELINE_ID = "nothing";
