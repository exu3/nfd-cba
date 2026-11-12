"use client";

// Small, reusable inputs. `kind` controls display:
//   "money"   -> $ with commas
//   "percent" -> shown as %, stored as decimal (3 -> 0.03)
//   "number"  -> plain
export function NumberField({ label, value, onChange, kind = "number", step, hint }) {
  const shown = kind === "percent" ? +(value * 100).toFixed(4) : value;
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="field-input">
        {kind === "money" && <span className="affix">$</span>}
        <input
          type="number"
          value={Number.isFinite(shown) ? shown : ""}
          step={step ?? (kind === "money" ? 1000 : kind === "percent" ? 0.1 : 1)}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            const n = Number.isFinite(v) ? v : 0;
            onChange(kind === "percent" ? n / 100 : n);
          }}
        />
        {kind === "percent" && <span className="affix">%</span>}
      </span>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export const fmtMoney = (x) =>
  x == null || !Number.isFinite(x)
    ? "—"
    : (x < 0 ? "−$" : "$") + Math.abs(Math.round(x)).toLocaleString("en-US");

export const fmtMoneyShort = (x) => {
  const a = Math.abs(x);
  const s = a >= 1e6 ? (a / 1e6).toFixed(2) + "M" : a >= 1e3 ? (a / 1e3).toFixed(0) + "k" : a.toFixed(0);
  return (x < 0 ? "−$" : "$") + s;
};

export const fmtPct = (x) => (x * 100).toFixed(1) + "%";
