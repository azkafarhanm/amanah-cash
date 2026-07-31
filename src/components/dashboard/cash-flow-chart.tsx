"use client";

import { useState } from "react";
import styles from "./dashboard-v2.module.css";

type DataPoint = {
  label: string;
  value: number;
};

type CashFlowChartProps = {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  formatValue?: (value: number) => string;
  color?: string;
};

export function CashFlowChart({
  data,
  title = "Tren Arus Kas",
  subtitle = "Saldo keseluruhan dari waktu ke waktu",
  formatValue = (v) => `Rp ${new Intl.NumberFormat("id-ID").format(v)}`,
  color = "var(--color-action-primary)",
}: CashFlowChartProps) {
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

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * innerWidth,
    y: padding.top + innerHeight - ((d.value - min) / range) * innerHeight,
  }));

  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpx1 = prev.x + (p.x - prev.x) * 0.4;
      const cpx2 = prev.x + (p.x - prev.x) * 0.6;
      return `C ${cpx1} ${prev.y} ${cpx2} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;

  const gridLines = 4;
  const gridValues = Array.from({ length: gridLines }, (_, i) => min + (range / (gridLines - 1)) * i);

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;
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

          <path d={areaD} fill={color} className={styles.chartArea} />
          <path d={pathD} stroke={color} className={styles.chartLine} />

          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 4 : 2}
              className={styles.chartDataPoint}
              stroke={color}
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

        {hoveredPoint && hoveredData && (
          <div
            className={styles.chartTooltip}
            style={{
              left: hoveredPoint.x,
              top: hoveredPoint.y - 48,
              transform: "translateX(-50%)",
            }}
          >
            <div>{hoveredData.label}</div>
            <div className={styles.chartTooltipValue}>{formatValue(hoveredData.value)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
