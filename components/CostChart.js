"use client";
import { useRef, useState } from "react";
import { downloadSvgAsPng } from "../lib/exportPng";
import { fmtMoney, fmtMoneyShort } from "./Inputs";

// Horizontal stacked bars: the alternative's own cost + expected risk cost
// = expected total 30-yr present-value cost.
export default function CostChart({
  results,
  title = "Simulated Expected Total Costs",
}) {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const W = 720,
    rowH = 44,
    left = 300,
    right = 80,
    top = 64;
  const H = top + results.length * rowH + 28;
  const max = Math.max(1, ...results.map((r) => r.totalPV));
  const x = (v) => (v / max) * (W - left - right);
  const GAP = 2;

  return (
    <div className="chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="Expected total present-value cost by alternative"
      >
        <text x={8} y={22} className="chart-title">
          {title}
        </text>
        <g transform="translate(8, 44)">
          <rect
            x={0}
            y={-6}
            width={12}
            height={12}
            rx={3}
            fill="var(--series-1)"
          />
          <text x={18} y={4} className="val">
            Alternative cost (capital + O&amp;M)
          </text>
          <rect
            x={250}
            y={-6}
            width={12}
            height={12}
            rx={3}
            fill="var(--series-2)"
          />
          <text x={268} y={4} className="val">
            Expected cost of contamination events
          </text>
        </g>

        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line
              x1={left + f * (W - left - right)}
              x2={left + f * (W - left - right)}
              y1={top}
              y2={H - 24}
              className="grid"
            />
            <text
              x={left + f * (W - left - right)}
              y={H - 8}
              className="tick"
              textAnchor="middle"
            >
              {fmtMoneyShort(f * max)}
            </text>
          </g>
        ))}
        {results.map((r, i) => {
          const y = top + i * rowH + 10;
          const h = rowH - 20;
          const w1 = x(r.ownPV),
            w2 = x(r.riskPV);
          return (
            <g key={r.id}>
              <text
                x={left - 10}
                y={y + h / 2 + 4}
                textAnchor="end"
                className="cat"
              >
                {r.name}
              </text>
              {w1 > 0 && (
                <rect
                  x={left}
                  y={y}
                  width={Math.max(0, w1 - (w2 > 0 ? GAP : 0))}
                  height={h}
                  rx={w2 > 0 ? 0 : 4}
                  fill="var(--series-1)"
                  onMouseEnter={() => setHover({ r, part: "own" })}
                  onMouseLeave={() => setHover(null)}
                />
              )}
              {w2 > 0 && (
                <rect
                  x={left + w1}
                  y={y}
                  width={w2}
                  height={h}
                  rx={4}
                  fill="var(--series-2)"
                  onMouseEnter={() => setHover({ r, part: "risk" })}
                  onMouseLeave={() => setHover(null)}
                />
              )}
              <text x={left + w1 + w2 + 6} y={y + h / 2 + 4} className="val">
                {fmtMoneyShort(r.totalPV)}
              </text>
            </g>
          );
        })}
      </svg>
      <button
        onClick={() => downloadSvgAsPng(svgRef.current, "cost-chart.png")}
      >
        Download PNG
      </button>
      {hover && (
        <div className="tooltip">
          <strong>{hover.r.name}</strong>
          <div>Alternative cost: {fmtMoney(hover.r.ownPV)}</div>
          <div>Expected event cost: {fmtMoney(hover.r.riskPV)}</div>
          <div>Total: {fmtMoney(hover.r.totalPV)}</div>
        </div>
      )}
    </div>
  );
}
