# NFD Source Protection — Cost/Benefit Dashboard

Risk-weighted cost/benefit comparison of the Norwich Fire District capstone alternatives:

1. Do nothing
2. Impervious slab / barrier (excavator buys the pit)
3. Monitoring wells on the gravel pit
4. Buy & conserve the land (land trust)

Hazards modeled: **PFAS reaching the well** (→ GAC treatment, permanent) and an
**emergency rail spill**. A replacement well is not an option, so that is not modeled.

## Run it

Requires Node 18.18+.

```bash
npm install
npm run dev        # open http://localhost:3000
npm run test:model # checks the math without the browser
```

## Where to put your numbers

**`lib/assumptions.js`** — every default lives here and is a PLACEHOLDER. Write the
source next to each number (vendor quote, DEC guidance, appraisal, etc.).
Everything can also be changed live in the browser; use “Download scenario” to save a set.

| Input | Meaning |
|---|---|
| `annualProbability` | Chance per year the hazard happens (0.02 = 2%/yr) |
| `oneTimeCost` | Cost in the year it happens (GAC install, emergency response) |
| `annualCostAfter` | Cost every year after (GAC media change-outs, extra sampling) |
| `repeatable` | PFAS = false (once it's there, it's there); spills = true |
| `capitalCost`, `annualOM` | What the alternative itself costs the District |
| `likelihoodFactor` | How the alternative changes the hazard's probability (0.5 = halves it) |
| `consequenceFactor` | How it changes the one-time cost (early warning → smaller emergency) |

To add a hazard (e.g. a fuel spill from equipment storage), add an object to
`DEFAULT_HAZARDS` and the UI picks it up automatically. Same for alternatives.

## How the math works (`lib/model.js`)

- **Alternative cost (PV)** = capital + annual O&M × PV annuity factor.
- **Expected event cost (PV)**, for each hazard and year *t*:
  - non-repeatable: P(first event in year t) = (1−p)^(t−1)·p
  - repeatable: P(event in year t) = p
  - × [one-time cost discounted to year t + ongoing costs discounted from t+1 to the horizon]
- **Benefit** = expected event cost avoided compared with Do nothing.
- **B/C ratio** = benefit ÷ extra cost of the alternative.
- **Monte Carlo** simulates thousands of possible futures with the same rules, to show the
  spread (most futures have no event; a few are very expensive).

Use a **real** discount rate (inflation removed) with costs in today's dollars.

## Ideas to extend

- A tornado chart: which single input swings the answer the most?
- A break-even finder: “What PFAS probability makes monitoring worth it?”
- Non-monetary criteria (public health, community values) as a weighted decision matrix next to the $ results.
- Grants (e.g. DWSRF / land conservation funding) as a negative capital cost.
