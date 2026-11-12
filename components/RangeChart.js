"use client";
import { useState } from "react";
import { fmtMoney, fmtMoneyShort, fmtPct } from "./Inputs";

// Monte Carlo spread: line = 10th–90th percentile of total PV cost,
// dot = median, tick = mean. Shows how "lucky vs unlucky" each option is.
export default function RangeChart({ results }) {
  const [hover, setHover] = useState(null);
  const W = 720, rowH = 40, left = 300, right = 40, top = 8;
  const H = top + results.length * rowH + 28;
  const max = Math.max(1, ...results.map((r) => Math.max(r.mc.p90, r.mc.mean)));
  const x = (v) => left + (v / max) * (W - left - right);

  return (
    <div className="chart-wrap">
      <div className="legend">
        <span><i className="line-key" /> 10th–90th percentile</span>
        <span><i className="dot-key" /> Median</span>
        <span><i className="tick-key" /> Mean</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Range of simulated total costs by alternative">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={x(f * max)} x2={x(f * max)} y1={top} y2={H - 24} className="grid" />
            <text x={x(f * max)} y={H - 8} className="tick" textAnchor="middle">{fmtMoneyShort(f * max)}</text>
          </g>
        ))}
        {results.map((r, i) => {
          const cy = top + i * rowH + rowH / 2;
          return (
            <g key={r.id} onMouseEnter={() => setHover(r)} onMouseLeave={() => setHover(null)}>
              <rect x={left} y={cy - rowH / 2} width={W - left - right} height={rowH} fill="transparent" />
              <text x={left - 10} y={cy + 4} textAnchor="end" className="cat">{r.name}</text>
              <line x1={x(r.mc.p10)} x2={x(r.mc.p90)} y1={cy} y2={cy} stroke="var(--series-1)" strokeWidth={2} strokeLinecap="round" />
              <line x1={x(r.mc.mean)} x2={x(r.mc.mean)} y1={cy - 8} y2={cy + 8} stroke="var(--text-secondary)" strokeWidth={2} />
              <circle cx={x(r.mc.p50)} cy={cy} r={5} fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      {hover && (
        <div className="tooltip">
          <strong>{hover.name}</strong>
          <div>10th pct: {fmtMoney(hover.mc.p10)}</div>
          <div>Median: {fmtMoney(hover.mc.p50)}</div>
          <div>90th pct: {fmtMoney(hover.mc.p90)}</div>
          <div>Mean: {fmtMoney(hover.mc.mean)}</div>
          <div>Chance of ≥1 event: {fmtPct(hover.mc.probAnyEvent)}</div>
        </div>
      )}
    </div>
  );
}
