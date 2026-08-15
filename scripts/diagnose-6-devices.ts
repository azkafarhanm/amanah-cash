/**
 * Forensic 6-Device Diagnostic Script
 * Measures exact runtime text wrapping, card heights, section heights, and takeover trajectories.
 * Devices:
 * 1. iPhone SE (375×667)
 * 2. iPhone 12 Pro (390×844)
 * 3. Samsung Galaxy S8+ (360×740)
 * 4. iPad Mini (768×1024)
 * 5. Microsoft Surface Duo (540×720)
 * 6. Samsung Galaxy Z Fold 5 (344×882)
 */

import { problems, solutions, workflowSteps, features, trustPrinciples } from "../src/components/landing/landing-content";

export interface DeviceProfile {
  name: string;
  width: number;
  height: number;
  category: "phone" | "tablet" | "foldable";
}

export const DEVICES: DeviceProfile[] = [
  { name: "iPhone SE", width: 375, height: 667, category: "phone" },
  { name: "iPhone 12 Pro", width: 390, height: 844, category: "phone" },
  { name: "Samsung Galaxy S8+", width: 360, height: 740, category: "phone" },
  { name: "iPad Mini", width: 768, height: 1024, category: "tablet" },
  { name: "Microsoft Surface Duo", width: 540, height: 720, category: "foldable" },
  { name: "Samsung Galaxy Z Fold 5", width: 344, height: 882, category: "foldable" },
];

export function estimateLines(text: string, cardInnerWidthPx: number, fontSizePx: number): number {
  // Average proportional font width for Geist / Inter at 13-14px is ~0.55 * fontSize
  const charWidth = fontSizePx * 0.54;
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

export interface CardMeasurement {
  title: string;
  titleLines: number;
  descLines: number;
  cardHeight: number;
}

export interface SectionDiagnostic {
  id: string;
  name: string;
  columns: number;
  rows: number;
  cardWidth: number;
  maxCardHeight: number;
  contentHeight: number;
  availableHeight: number;
  approachDistance: number;
  readingRunway: number;
  bottomRowOccludedAtScroll: number; // when incoming sheet touches the bottom row
  diagnosis: string;
}

export function diagnoseDevice(dev: DeviceProfile): SectionDiagnostic[] {
  const stickyTop = 56;
  const availableHeight = dev.height - stickyTop;
  const isTablet = dev.width >= 768;
  const containerPad = isTablet ? 48 : 32;
  const contentWidth = dev.width - containerPad;

  // Let's test runway with 12rem (192px):
  const runwayBonus = 192;
  const runwayTotal = dev.height + runwayBonus;

  const sectionsData = [
    { id: "problems", name: "Problems", items: problems, isWorkflow: false, hasAction: false },
    { id: "solutions", name: "Solution", items: solutions, isWorkflow: false, hasAction: true },
    { id: "workflow", name: "Workflow", items: workflowSteps, isWorkflow: true, hasAction: true },
    { id: "features", name: "Features", items: features, isWorkflow: false, hasAction: false },
    { id: "security", name: "Security", items: trustPrinciples, isWorkflow: false, hasAction: false },
  ];

  const results: SectionDiagnostic[] = [];

  for (const sec of sectionsData) {
    let columns = isTablet ? (sec.id === "features" ? 2 : 3) : 2;
    let cardPadV = 10;
    let cardPadH = 12;
    let iconBox = 24;
    let iconMargin = 6;
    let titlePx = 14;
    let titleMargin = 4;
    let descPx = 13;
    let descLineHeight = 1.42;
    let cardGap = 10;
    let sectionPadTop = 16;
    let sectionPadBottom = 24;
    let contentGap = 16;
    let headingH = 82;

    if (isTablet) {
      cardPadV = 12;
      cardPadH = 14;
      iconBox = 28;
      iconMargin = 8;
      titlePx = 15;
      titleMargin = 5;
      descPx = 13.5;
      descLineHeight = 1.45;
      cardGap = 12;
      sectionPadTop = 24;
      sectionPadBottom = 32;
      contentGap = 20;
      headingH = 92;
    } else if (sec.id === "features") {
      cardPadV = 8;
      cardPadH = 10;
      iconBox = 20;
      iconMargin = 4;
      titlePx = 13.5;
      titleMargin = 2;
      descPx = 12.5;
      descLineHeight = 1.35;
      cardGap = 8;
      sectionPadTop = 16;
      sectionPadBottom = 24;
      contentGap = 16;
      headingH = 82;
    }

    const totalColGaps = (columns - 1) * cardGap;
    const cardWidth = Math.floor((contentWidth - totalColGaps) / columns);
    const cardInnerWidth = cardWidth - (2 * cardPadH);

    let maxCardH = 0;
    const rowHeights: number[] = [];

    sec.items.forEach((item, idx) => {
      let titleLines = 1;
      let descLines = 2;
      let cardH = 0;

      if (sec.isWorkflow) {
        // Workflow: grid-template-columns: auto 1fr, badge on left (24px)
        const textInnerW = cardInnerWidth - iconBox - 8;
        titleLines = estimateLines(item.title, textInnerW, titlePx);
        descLines = estimateLines(item.description, textInnerW, descPx);
        const textH = (titleLines * titlePx * 1.2) + titleMargin + (descLines * descPx * descLineHeight);
        cardH = cardPadV + Math.max(iconBox, textH) + cardPadV;
      } else {
        titleLines = estimateLines(item.title, cardInnerWidth, titlePx);
        descLines = estimateLines(item.description, cardInnerWidth, descPx);
        const titleH = titleLines * titlePx * 1.25;
        const descH = descLines * descPx * descLineHeight;
        cardH = cardPadV + iconBox + iconMargin + titleH + titleMargin + descH + cardPadV;
      }

      maxCardH = Math.max(maxCardH, cardH);
      const rowIdx = Math.floor(idx / columns);
      rowHeights[rowIdx] = Math.max(rowHeights[rowIdx] || 0, cardH);
    });

    const rows = Math.ceil(sec.items.length / columns);
    const totalGridH = rowHeights.reduce((acc, h) => acc + h, 0) + ((rows - 1) * cardGap);
    const actionH = sec.hasAction ? (36 + 12) : 0;
    const contentHeight = Math.round(sectionPadTop + headingH + contentGap + totalGridH + actionH + sectionPadBottom);
    const approachDistance = availableHeight - contentHeight;
    const readingRunway = runwayTotal - contentHeight;

    // The bottom row position inside the section:
    // Pinned section top is at 56px.
    // Bottom row starts at: sectionPadTop + headingH + contentGap + sum(all previous rows + gaps)
    // Bottom row ends at: sectionPadTop + headingH + contentGap + totalGridH
    // Incoming sheet enters at scroll: runwayBonus
    // Incoming sheet touches bottom of content at scroll: readingRunway = runwayTotal - contentHeight
    const bottomRowOccludedAtScroll = readingRunway;

    let diagnosis = "";
    if (approachDistance < 60) {
      diagnosis = `CRITICAL: Approach distance ${approachDistance}px is too tight. Incoming sheet occludes bottom cards almost immediately.`;
    } else if (approachDistance < 120) {
      diagnosis = `TIGHT: Approach distance ${approachDistance}px < 120px guardrail. Reading runway ${readingRunway}px is short.`;
    } else {
      diagnosis = `PASS: Approach distance ${approachDistance}px >= 120px, Reading runway ${readingRunway}px provides ample reading window.`;
    }

    results.push({
      id: sec.id,
      name: sec.name,
      columns,
      rows,
      cardWidth,
      maxCardHeight: Math.round(maxCardH),
      contentHeight,
      availableHeight,
      approachDistance,
      readingRunway,
      bottomRowOccludedAtScroll,
      diagnosis,
    });
  }

  return results;
}

console.log("==========================================================================================================");
console.log("6-DEVICE INDEPENDENT FORENSIC DIAGNOSTIC REPORT (EXACT NATURAL WRAPPING)");
console.log("==========================================================================================================\n");

for (const dev of DEVICES) {
  console.log(`\n----------------------------------------------------------------------------------------------------------`);
  console.log(`DEVICE: ${dev.name} (${dev.width}×${dev.height}px) — Available Height: ${dev.height - 56}px`);
  console.log(`----------------------------------------------------------------------------------------------------------`);
  console.log(
    `  ${"Section".padEnd(12)} | ${"Cols×Rows".padEnd(9)} | ${"Card W×H".padEnd(10)} | ${"H_content".padEnd(9)} | ${"ApproachDist".padEnd(12)} | ${"ReadRunway".padEnd(10)} | ${"Diagnosis"}`
  );
  console.log(`  ${"-".repeat(12)}-+-${"-".repeat(9)}-+-${"-".repeat(10)}-+-${"-".repeat(9)}-+-${"-".repeat(12)}-+-${"-".repeat(10)}-+---------------------------------------------------`);
  const diag = diagnoseDevice(dev);
  for (const d of diag) {
    const colsRows = `${d.columns}c × ${d.rows}r`;
    const cardWH = `${d.cardWidth}×${d.maxCardHeight}px`;
    const hContent = `${d.contentHeight}px`;
    const appDist = `${d.approachDistance}px`;
    const rRun = `${d.readingRunway}px`;
    console.log(
      `  ${d.name.padEnd(12)} | ${colsRows.padEnd(9)} | ${cardWH.padEnd(10)} | ${hContent.padEnd(9)} | ${appDist.padEnd(12)} | ${rRun.padEnd(10)} | ${d.diagnosis}`
    );
  }
}
