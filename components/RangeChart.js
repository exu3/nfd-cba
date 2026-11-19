"use client";
import { useRef, useState } from "react";
import { downloadSvgAsPng } from "../lib/exportPng";
import { fmtMoney, fmtMoneyShort, fmtPct } from "./Inputs";

// Monte Carlo spread: line = 10th–90th percentile of total PV cost,
// dot = median, tick = mean. Shows how "lucky vs unlucky" each option is.
export default function RangeChart({
  results,
  title = "Range of Simulated 30-Year Costs by Alternative",
}) {
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  const W = 720,
    rowH = 40,
    left = 300,
    right = 40,
    top = 64;
  const H = top + results.length * rowH + 28;
  const max = Math.max(1, ...results.map((r) => Math.max(r.mc.p90, r.mc.mean)));
  const x = (v) => left + (v / max) * (W - left - right);

  return (
    <div className="chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="Range of simulated total costs by alternative"
      >
        {/* Title */}
        <text x={8} y={22} className="chart-title">
          {title}
        </text>

        {/* Legend */}
        <g transform="translate(8, 44)">
          <line
            x1={0}
            x2={18}
            y1={0}
            y2={0}
            stroke="var(--series-1)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <text x={24} y={4} className="val">
            10th–90th percentile
          </text>

          <circle
            cx={180}
            cy={0}
            r={5}
            fill="var(--series-1)"
            stroke="var(--surface-1)"
            strokeWidth={2}
          />
          <text x={190} y={4} className="val">
            Median
          </text>

          <line
            x1={262}
            x2={262}
            y1={-8}
            y2={8}
            stroke="var(--text-secondary)"
            strokeWidth={2}
          />
          <text x={270} y={4} className="val">
            Mean
          </text>
        </g>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line
              x1={x(f * max)}
              x2={x(f * max)}
              y1={top}
              y2={H - 24}
              className="grid"
            />
            <text x={x(f * max)} y={H - 8} className="tick" textAnchor="middle">
              {fmtMoneyShort(f * max)}
            </text>
          </g>
        ))}
        {results.map((r, i) => {
          const cy = top + i * rowH + rowH / 2;
          return (
            <g
              key={r.id}
              onMouseEnter={() => setHover(r)}
              onMouseLeave={() => setHover(null)}
            >
              <rect
                x={left}
                y={cy - rowH / 2}
                width={W - left - right}
                height={rowH}
                fill="transparent"
              />
              <text x={left - 10} y={cy + 4} textAnchor="end" className="cat">
                {r.name}
              </text>
              <line
                x1={x(r.mc.p10)}
                x2={x(r.mc.p90)}
                y1={cy}
                y2={cy}
                stroke="var(--series-1)"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <line
                x1={x(r.mc.mean)}
                x2={x(r.mc.mean)}
                y1={cy - 8}
                y2={cy + 8}
                stroke="var(--text-secondary)"
                strokeWidth={2}
              />
              <circle
                cx={x(r.mc.p50)}
                cy={cy}
                r={5}
                fill="var(--series-1)"
                stroke="var(--surface-1)"
                strokeWidth={2}
              />
            </g>
          );
        })}
      </svg>
      <button
        onClick={() => downloadSvgAsPng(svgRef.current, "range-chart.png")}
      >
        Download PNG
      </button>
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
