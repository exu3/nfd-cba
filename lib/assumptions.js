// =====================================================================
//  ALL THE NUMBERS LIVE HERE.
//  values here are defaults; editabble form fields in UI as well
//
//  Units: dollars are in today's dollars (real), rates are decimals
//  (0.03 = 3%), probabilities are per-year (0.01 = 1% chance each year).
// =====================================================================

export const DEFAULT_SETTINGS = {
  horizonYears: 30, // analysis period
  discountRate: 0.03,
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
    annualProbability: 0.001,
    repeatable: false,
    oneTimeCost: 172_000, // src: Bristol VT PFAS treatment estimate
    annualCostAfter: 6_000, // src: Bristol VT PFAS treatment estimate
    notes:
      "PFAS reaches well due to contaminated fill stored on gravel pit. Remediation would be at the treatment stage, using granular activated carbon (GAC). Cost estimates from Cliche et al. (2020)",
  },
  {
    id: "trans_accident",
    name: "Severe accident on transportation corridor (hazmat spill)",
    annualProbability: 0.0001, // no hazmat spills reported in the last 30 years
    repeatable: true,
    oneTimeCost: 600_000, // RG estimate
    annualCostAfter: 0,
    notes:
      "No known hazmat spills reported in the last 30 years. High consequence, low probability event. Remediation cost considers excavation and removal of contaminated soil and/or pump and treat for contaminated gw.",
  },
  {
    id: "fuel",
    name: "Fuel / hydraulic fluid spill from equipment stored on pit",
    annualProbability: 0.0001,
    // 2001 doc reports several spills (almost every year), but one of significant enough mangitude to contaminate the well has not occured
    // - 9/1996: 70 gal of hydraulic oil from an excavator fire, about 2,000 ft north of the wells
    // - 5/1997: 25–30 gal of hydraulic oil from a burst excavator hose in the Farrell gravel pit
    // - 9/1998: 200 gal of diesel on Jake Guest’s property on Butternut Lane, fully cleaned up
    // - 8/2000: two small gravel pit releases (vandalized payloader hoses, and a dump truck’s power steering ho
    repeatable: true,
    oneTimeCost: 600_000, // RG estimate
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
    name: "2. Install LLDPE geomembrane liner",
    capitalCost: 116_000, // RG
    annualOM: 0, // none?
    effects: {
      pfas: { likelihoodFactor: 0.5, consequenceFactor: 1.0 },
      trans_accident: { likelihoodFactor: 1.0, consequenceFactor: 1.0 },
      fuel: { likelihoodFactor: 1.0, consequenceFactor: 0.5 },
    },
    notes: "Install a 10 acres of LLDPE geomembrane liner on the gravel pit.",
  },
  {
    id: "monitoring",
    name: "3. Install 5 monitoring wells on gravel pit",
    capitalCost: 30_000, // P-W quote
    annualOM: 4_125, // $825 per sample * 5 samples
    effects: {
      pfas: { likelihoodFactor: 0.5, consequenceFactor: 0.5 },
      fuel: { likelihoodFactor: 1.0, consequenceFactor: 0.5 },
      trans_accident: { likelihoodFactor: 1.0, consequenceFactor: 0.5 },
    },
    notes:
      "Early warning: time to install treatment and/or act on the source before customers are exposed.",
  },
  {
    id: "sop",
    name: "4. Act 250 conditions for gravel pit operations",
    capitalCost: 2_000, // legal fees for consulting a laywer
    annualOM: 0,
    effects: {
      pfas: { likelihoodFactor: 0.1, consequenceFactor: 1 },
      fuel: { likelihoodFactor: 1.0, consequenceFactor: 1 },
      trans_accident: { likelihoodFactor: 1.0, consequenceFactor: 1 },
    },
    notes:
      "Owner must keep SDS records of all materials and test any unknown materials before storing on land. Significantly reduces contamination risk from PFAS or other hazardous compounds. Feasibility pending laywer advice.",
  },
  {
    id: "conserve",
    name: "5. NFD to buy & conserve 10-acre gravel pit",
    // 10 ac × ~$15k/ac = $150k (range $100k–$200k; parcel avg is $10k/ac)
    // + ~$20k survey/subdivision, appraisal, Phase I ESA, legal, closing
    // Subtract any land trust / grant contribution here.
    capitalCost: 170_000,
    annualOM: 2_000, // stewardship / easement monitoring
    effects: {
      pfas: { likelihoodFactor: 0.05, consequenceFactor: 1.0 },
      fuel: { likelihoodFactor: 0.0, consequenceFactor: 1.0 }, // no equipment stored on it
      trans_accident: { likelihoodFactor: 1.0, consequenceFactor: 1.0 },
    },
    notes:
      "Removes the gravel-pit as a contamination source. Transportation corridor risk is unaddressed.",
  },
];

export const BASELINE_ID = "nothing";
