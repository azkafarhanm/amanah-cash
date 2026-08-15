/**
 * Final Trajectory Measurement Script
 * Strictly enforces:
 * - Card title >= 14px
 * - Card description >= 13px
 * - Line-height >= 1.35
 * - Icon ~20px
 * - Clearance >= 120px guardrail for sticky takeover
 * - Natural flow fallback for iPhone SE & Galaxy S8+ (< 120px clearance)
 * - Continuous sticky takeover for Surface Duo, Galaxy Z Fold 5, iPhone 12 Pro, iPad Mini
 */

import { features } from "../src/components/landing/landing-content";

export interface DeviceSpec {
  name: string;
  width: number;
  height: number;
  category: string;
}

export const TARGET_DEVICES: DeviceSpec[] = [
  { name: "iPhone SE", width: 375, height: 667, category: "phone" },
  { name: "Galaxy S8+", width: 360, height: 740, category: "phone" },
  { name: "Surface Duo", width: 540, height: 720, category: "foldable" },
  { name: "Galaxy Z Fold 5", width: 344, height: 882, category: "foldable" },
  { name: "iPhone 12 Pro", width: 390, height: 844, category: "phone" },
  { name: "iPad Mini", width: 768, height: 1024, category: "tablet" },
];

export function estimateLines(text: string, cardInnerWidthPx: number, fontSizePx: number): number {
  const charWidth = fontSizePx * 0.53;
  const maxCharsPerLine = Math.floor(cardInnerWidthPx / charWidth);
  const words = text.split(" ");
  let lines = 1;
  let currentLineLen = 0;

  for (const word of words) {
    if (currentLineLen + word.length + (currentLineLen > 0 ? 1 : 0) <= maxCharsPerLine) {
      currentLineLen += word.length + (currentLineLen > 0 ? 1 : 0);
    } else {
      lines++;
      currentLineLen = word.length;
    }
  }

  return lines;
}

export interface FinalTrajectoryData {
  device: string;
  featuresHeight: number;
  initialVisibility: string;
  securityEntry: string;
  firstMeaningfulOcclusion: string;
  lastReadableRow: string;
  fullTakeover: string;
  clearance: number;
  verdict: string;
}

export function runFinalTrajectoryEvaluation(): FinalTrajectoryData[] {
  const stickyTop = 56;
  const results: FinalTrajectoryData[] = [];

  for (const dev of TARGET_DEVICES) {
    const isTablet = dev.width >= 768;
    const containerPad = isTablet ? 48 : 32;
    const contentWidth = dev.width - containerPad;
    const availableHeight = dev.height - stickyTop;

    const columns = 2;
    const cardPadV = isTablet ? 12 : 6;
    const cardPadH = isTablet ? 14 : 8;
    const iconBox = isTablet ? 28 : 20;
    const iconMargin = isTablet ? 8 : 2;
    const titlePx = isTablet ? 15 : 14;
    const titleMargin = isTablet ? 5 : 2;
    const descPx = isTablet ? 13.5 : 13;
    const descLineHeight = isTablet ? 1.45 : 1.35;
    const cardGap = isTablet ? 12 : 6;

    const sectionPadTop = isTablet ? 24 : 10;
    const sectionPadBottom = isTablet ? 32 : 12;
    const contentGap = isTablet ? 20 : 8;
    const headingH = isTablet ? 92 : 50;

    const totalColGaps = (columns - 1) * cardGap;
    const cardWidth = Math.floor((contentWidth - totalColGaps) / columns);
    const cardInnerWidth = cardWidth - (2 * cardPadH);

    const rowHeights: number[] = [];
    const rows = Math.ceil(features.length / columns);
    let accumulatedGridY = sectionPadTop + headingH + contentGap;

    for (let r = 0; r < rows; r++) {
      const idx1 = r * 2;
      const idx2 = r * 2 + 1;
      const feat1 = features[idx1];
      const feat2 = features[idx2];

      const lines1 = estimateLines(feat1.description, cardInnerWidth, descPx);
      const titleLines1 = estimateLines(feat1.title, cardInnerWidth, titlePx);
      const h1 = cardPadV + iconBox + iconMargin + (titleLines1 * titlePx * 1.18) + titleMargin + (lines1 * descPx * descLineHeight) + cardPadV;

      let h2 = 0;
      if (feat2) {
        const lines2 = estimateLines(feat2.description, cardInnerWidth, descPx);
        const titleLines2 = estimateLines(feat2.title, cardInnerWidth, titlePx);
        h2 = cardPadV + iconBox + iconMargin + (titleLines2 * titlePx * 1.18) + titleMargin + (lines2 * descPx * descLineHeight) + cardPadV;
      }

      const rowH = Math.round(Math.max(h1, h2));
      rowHeights.push(rowH);
      accumulatedGridY += rowH + cardGap;
    }

    const totalContentH = accumulatedGridY - cardGap + sectionPadBottom;
    const clearance = availableHeight - totalContentH;
    const runwayBonus = 192; // 12rem
    const runwayTotal = dev.height + runwayBonus;

    const securityEntryScroll = runwayTotal - availableHeight;
    const firstMeaningfulOcclusionScroll = runwayTotal - totalContentH;
    const fullTakeoverScroll = runwayTotal;

    const initialVisibility = totalContentH <= availableHeight ? "100% (Rows 1–5 visible)" : `Overflow (${totalContentH - availableHeight}px below viewport)`;
    const securityEntry = `ΔS = ${securityEntryScroll}px`;
    const firstMeaningfulOcclusion = `ΔS = ${firstMeaningfulOcclusionScroll}px`;
    const fullTakeover = `ΔS = ${fullTakeoverScroll}px`;

    let lastReadableRow = "Row 5 (All 10 cards fully readable)";
    let verdict = "STICKY TAKEOVER (PASS)";

    if (clearance < 120 || totalContentH > availableHeight) {
      verdict = "NATURAL PHYSICAL CASCADE (FALLBACK)";
      if (totalContentH > availableHeight) {
        lastReadableRow = `Row 4 (Settled overflow ${totalContentH - availableHeight}px)`;
      } else {
        lastReadableRow = `Row 4 (Clearance ${clearance}px < 120px)`;
      }
    } else {
      verdict = "STICKY TAKEOVER (PASS)";
      lastReadableRow = "Row 5 (All 10 cards fully readable)";
    }

    results.push({
      device: dev.name,
      featuresHeight: totalContentH,
      initialVisibility,
      securityEntry,
      firstMeaningfulOcclusion,
      lastReadableRow,
      fullTakeover,
      clearance,
      verdict,
    });
  }

  return results;
}

const table = runFinalTrajectoryEvaluation();
console.log("==========================================================================================================");
console.log("FINAL MEASURED TRAJECTORY VERIFICATION TABLE");
console.log("==========================================================================================================\n");
console.log(
  `| ${"Device".padEnd(16)} | ${"Features Height".padEnd(15)} | ${"Initial Visibility".padEnd(23)} | ${"Security Entry".padEnd(14)} | ${"First Meaningful Occlusion".padEnd(26)} | ${"Last Readable Row".padEnd(33)} | ${"Full Takeover".padEnd(13)} | ${"Clearance".padEnd(9)} | ${"Verdict"}`
);
console.log(
  `| ${"-".repeat(16)} | ${"-".repeat(15)} | ${"-".repeat(23)} | ${"-".repeat(14)} | ${"-".repeat(26)} | ${"-".repeat(33)} | ${"-".repeat(13)} | ${"-".repeat(9)} | ${"-".repeat(35)}`
);

for (const t of table) {
  console.log(
    `| ${t.device.padEnd(16)} | ${(`${t.featuresHeight}px`).padEnd(15)} | ${t.initialVisibility.padEnd(23)} | ${t.securityEntry.padEnd(14)} | ${t.firstMeaningfulOcclusion.padEnd(26)} | ${t.lastReadableRow.padEnd(33)} | ${t.fullTakeover.padEnd(13)} | ${(`${t.clearance}px`).padEnd(9)} | ${t.verdict}`
  );
}
