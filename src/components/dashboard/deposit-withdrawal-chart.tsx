"use client";

import { useState } from "react";
import styles from "./dashboard-v2.module.css";

type DataPoint = {
  label: string;
  deposits: number;
  withdrawals: number;
};

type DepositWithdrawalChartProps = {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  formatValue?: (value: number) => string;
};

export function DepositWithdrawalChart({
  data,
  title = "Setoran vs Penarikan",
  subtitle = "Perbandingan arus kas masuk dan keluar",
  formatValue = (v) => `Rp ${new Intl.NumberFormat("id-ID").format(v)}`,
}: DepositWithdrawalChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length < 2) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>{title}</h3>
            <p className={styles.chartSubtitle}>{subtitle}</p>
          </div>
        </div>
        <div className={styles.emptyState}>
          <p className={styles.emptyStateDescription}>Data tidak cukup untuk menampilkan grafik</p>
        </div>
      </div>
    );
  }

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const allValues = data.flatMap((d) => [d.deposits, d.withdrawals]);
  const min = 0;
  const max = Math.max(...allValues);
  const range = max || 1;

  const depositColor = "var(--deposit-color)";
  const withdrawalColor = "var(--withdrawal-color)";

  const depositPoints = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * innerWidth,
    y: padding.top + innerHeight - ((d.deposits - min) / range) * innerHeight,
  }));

  const withdrawalPoints = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * innerWidth,
    y: padding.top + innerHeight - ((d.withdrawals - min) / range) * innerHeight,
  }));

  const depositPath = depositPoints
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = depositPoints[i - 1];
      const cpx1 = prev.x + (p.x - prev.x) * 0.4;
      const cpx2 = prev.x + (p.x - prev.x) * 0.6;
      return `C ${cpx1} ${prev.y} ${cpx2} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  const withdrawalPath = withdrawalPoints
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = withdrawalPoints[i - 1];
      const cpx1 = prev.x + (p.x - prev.x) * 0.4;
      const cpx2 = prev.x + (p.x - prev.x) * 0.6;
      return `C ${cpx1} ${prev.y} ${cpx2} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  const gridLines = 4;
  const gridValues = Array.from({ length: gridLines }, (_, i) => min + (range / (gridLines - 1)) * i);

  const hoveredDeposit = hoveredIndex !== null ? depositPoints[hoveredIndex] : null;
  const hoveredWithdrawal = hoveredIndex !== null ? withdrawalPoints[hoveredIndex] : null;
  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>{title}</h3>
          <p className={styles.chartSubtitle}>{subtitle}</p>
        </div>
      </div>

      <div className={styles.chartBody} style={{ position: "relative" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={styles.chartSvg}
          role="img"
          aria-label={`${title}: ${subtitle}`}
        >
          {gridValues.map((value, i) => {
            const y = padding.top + innerHeight - ((value - min) / range) * innerHeight;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  className={styles.chartGridLine}
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className={styles.chartAxisLabel}
                >
                  {formatValue(value).replace("Rp ", "")}
                </text>
              </g>
            );
          })}

          <path d={depositPath} stroke={depositColor} className={styles.chartLine} />
          <path d={withdrawalPath} stroke={withdrawalColor} className={styles.chartLine} />

          {depositPoints.map((p, i) => (
            <circle
              key={`d-${i}`}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 4 : 2}
              className={styles.chartDataPoint}
              stroke={depositColor}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: "pointer" }}
            />
          ))}

          {withdrawalPoints.map((p, i) => (
            <circle
              key={`w-${i}`}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 4 : 2}
              className={styles.chartDataPoint}
              stroke={withdrawalColor}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: "pointer" }}
            />
          ))}

          {data.map((d, i) => {
            const x = padding.left + (i / (data.length - 1)) * innerWidth;
            return (
              <text
                key={i}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className={styles.chartAxisLabel}
              >
                {d.label}
              </text>
            );
          })}
        </svg>

        {hoveredData && hoveredDeposit && hoveredWithdrawal && (
          <div
            className={styles.chartTooltip}
            style={{
              left: hoveredDeposit.x,
              top: Math.min(hoveredDeposit.y, hoveredWithdrawal.y) - 64,
              transform: "translateX(-50%)",
            }}
          >
            <div>{hoveredData.label}</div>
            <div style={{ color: depositColor }}>
              Setoran: <span className={styles.chartTooltipValue}>{formatValue(hoveredData.deposits)}</span>
            </div>
            <div style={{ color: withdrawalColor }}>
              Penarikan: <span className={styles.chartTooltipValue}>{formatValue(hoveredData.withdrawals)}</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.chartLegend}>
        <div className={styles.chartLegendItem}>
          <span className={styles.chartLegendDot} style={{ background: depositColor }} />
          <span>Setoran</span>
        </div>
        <div className={styles.chartLegendItem}>
          <span className={styles.chartLegendDot} style={{ background: withdrawalColor }} />
          <span>Penarikan</span>
        </div>
      </div>
    </div>
  );
}
