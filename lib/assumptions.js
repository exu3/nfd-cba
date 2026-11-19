// =====================================================================
//  ALL THE NUMBERS LIVE HERE.
//  values here are defaults; editabble form fields in UI as well
//
//  Units: dollars are in today's dollars (real), rates are decimals
//  (0.03 = 3%), probabilities are per-year (0.01 = 1% chance each year).
// =====================================================================

export const DEFAULT_SETTINGS = {
  horizonYears: 30, // analysis period
  discountRate: 0.03, // REAL discount rate (inflation removed)
  monteCarloRuns: 50000, // simulated futures per alternative
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
    name: "PFAS reaches the well",
    annualProbability: 0.02, // PLACEHOLDER
    repeatable: false,
    oneTimeCost: 172_000, // src: Bristol VT PFAS treatment estimate
    annualCostAfter: 6_000, // src: Bristol VT PFAS treatment estimate
    notes:
      "PFAS reaches well due to contaminated fill stored on gravel pit. Remediation would be at the treatment stage, using granular activated carbon (GAC). Cost estimates from Cliche et al. (2020)",
  },
  {
    id: "transpo",
    name: "Emergency event: spill on transportation corridor",
    annualProbability: 0.01, // PLACEHOLDER: THIS MUST BE CALCULATED BASED ON HISTORICLA DATA
    repeatable: true,
    oneTimeCost: 100_000, // GUESS
    annualCostAfter: 0,
    notes:
      "High consequence, low probability event. Remediation cost considers excavation and removal of contaminated soil and/or pump and treat for contaminated gw.",
  },
  {
    id: "fuel",
    name: "Fuel / hydraulic fluid spill from equipment stored on pit",
    annualProbability: 0.02, // ESTIMATE: 2%/yr chance of a release big enough to reach groundwater
    repeatable: true,
    oneTimeCost: 100_000, // GUESS
    annualCostAfter: 0,
    notes:
      "A spill of diesel, gasoline, hydraulic fluid big enough to contaminate groundwater. Remediation cost considers excavation and removal of contaminated soil and/or pump and treat for contaminated gw.",
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
    name: "1. Do nothing (excavator buys pit, no mitigation)",
    capitalCost: 0,
    annualOM: 0,
    effects: {},
    notes: "Benchmark scenario. Every other alternative is compared to this.",
  },
  {
    id: "barrier",
    name: "2. Impervious slab / barrier (excavator buys pit)",
    capitalCost: 10_000, // approx 50x50? but theoretically zero because the excavator should pay for it.
    annualOM: 100, // caulking cracks or somethign but should be zero
    effects: {
      pfas: { likelihoodFactor: 0.5, consequenceFactor: 1.0 },
      transpo: { likelihoodFactor: 1.0, consequenceFactor: 1.0 },
      fuel: { likelihoodFactor: 1.0, consequenceFactor: 0.5 },
    },
    notes:
      "Reduces infiltration from stored materials/equip, depends on owner upkeep.",
  },
  {
    id: "monitoring",
    name: "3. Install (3) monitoring wells on gravel pit",
    capitalCost: 24_000, // 3x $8k each (just guessing)
    // per well/yr: $800 lab kit (EPA 533 + 537) + $215 labor
    //   (1 hr × 2 field techs × $107.41/hr) = $1,015 → × 3 wells
    annualOM: 3_045,
    effects: {
      pfas: { likelihoodFactor: 0.5, consequenceFactor: 0.5 },
      fuel: { likelihoodFactor: 1.0, consequenceFactor: 0.5 },
      transpo: { likelihoodFactor: 1.0, consequenceFactor: 0.5 },
    },
    notes:
      "Early warning: time to install treatment and/or act on the source before customers are exposed.",
  },
  {
    id: "monitoring",
    name: "3,5. Implement SOP for fill testing before import",
    capitalCost: 1_000, // legal fees for consulting a laywer
    annualOM: 0,
    effects: {
      pfas: { likelihoodFactor: 0.1, consequenceFactor: 1 },
      fuel: { likelihoodFactor: 1.0, consequenceFactor: 1 },
      transpo: { likelihoodFactor: 1.0, consequenceFactor: 1 },
    },
    notes:
      "Significantly reduces contamination risk from PFAS or other hazardous compounds. Feasibility pending laywer advice.",
  },
  {
    id: "conserve",
    name: "4. NFD to buy & conserve 10 acres of gravel pit",
    // 10 ac × ~$15k/ac = $150k (range $100k–$200k; parcel avg is $10k/ac)
    // + ~$20k survey/subdivision, appraisal, Phase I ESA, legal, closing
    // Subtract any land trust / grant contribution here.
    capitalCost: 170_000,
    annualOM: 2_000, // stewardship / easement monitoring
    effects: {
      pfas: { likelihoodFactor: 0.05, consequenceFactor: 1.0 },
      fuel: { likelihoodFactor: 0.0, consequenceFactor: 1.0 }, // no equipment stored on it
      transpo: { likelihoodFactor: 1.0, consequenceFactor: 1.0 },
    },
    notes:
      "Removes the gravel-pit sources. Does not affect transportation corridor.",
  },
];

export const BASELINE_ID = "nothing";
