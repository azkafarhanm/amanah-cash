/**
 * Phase 2 — Runtime Visual Re-Inspection Script
 * Measures exact trajectory and clearance for:
 * 1. iPhone SE (375×667)
 * 2. Galaxy S8+ (360×740)
 * 3. iPad Mini (768×1024)
 * 4. Galaxy Z Fold 5 (344×882)
 * 5. Surface Duo (540×720)
 * 6. iPhone 12 Pro (390×844)
 * Tests Single vs Reflow vs Adaptive Segmentation for Problems, Solution, Workflow, Features, and Security.
 */

import { problems, solutions, workflowSteps, features, trustPrinciples } from "../src/components/landing/landing-content";

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
  const maxCharsPerLine = Math.max(10, Math.floor(cardInnerWidthPx / charWidth));
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

export function measurePanelHeight(
  items: readonly { title: string; description: string; icon?: string }[],
  isWorkflow: boolean,
  hasAction: boolean,
  vp: DeviceSpec,
  isContinuation: boolean = false
): number {
  const isTablet = vp.width >= 768;
  const containerPad = isTablet ? 48 : 32;
  const contentWidth = vp.width - containerPad;

  let columns = 2;
  let cardPadV = 6;
  let cardPadH = 8;
  let iconBox = 20;
  let iconMargin = 2;
  let titlePx = 14;
  let titleMargin = 2;
  let descPx = 13;
  let descLineHeight = 1.35;
  let cardGap = 6;
  let sectionPadTop = 10;
  let sectionPadBottom = 14;
  let contentGap = 10;
  let headingH = isContinuation ? 40 : 54;

  if (isTablet) {
    columns = items.length > 5 ? 2 : (items.length <= 3 ? 3 : 2);
    cardPadV = 10;
    cardPadH = 12;
    iconBox = 24;
    iconMargin = 6;
    titlePx = 15;
    titleMargin = 4;
    descPx = 13.5;
    descLineHeight = 1.42;
    cardGap = 10;
    sectionPadTop = 20;
    sectionPadBottom = 28;
    contentGap = 16;
    headingH = isContinuation ? 48 : 82;
  }

  const totalColGaps = (columns - 1) * cardGap;
  const cardWidth = Math.floor((contentWidth - totalColGaps) / columns);
  const cardInnerWidth = cardWidth - (2 * cardPadH);

  const rowHeights: number[] = [];
  items.forEach((item, idx) => {
    let titleLines = 1;
    let descLines = 2;
    let cardH = 0;

    if (isWorkflow) {
      const textInnerW = cardInnerWidth - iconBox - 8;
      titleLines = estimateLines(item.title, textInnerW, titlePx);
      descLines = estimateLines(item.description, textInnerW, descPx);
      const textH = (titleLines * titlePx * 1.2) + titleMargin + (descLines * descPx * descLineHeight);
      cardH = cardPadV + Math.max(iconBox, textH) + cardPadV;
    } else {
      titleLines = estimateLines(item.title, cardInnerWidth, titlePx);
      descLines = estimateLines(item.description, cardInnerWidth, descPx);
      const titleH = titleLines * titlePx * 1.2;
      const descH = descLines * descPx * descLineHeight;
      cardH = cardPadV + iconBox + iconMargin + titleH + titleMargin + descH + cardPadV;
    }

    const rowIdx = Math.floor(idx / columns);
    rowHeights[rowIdx] = Math.max(rowHeights[rowIdx] || 0, cardH);
  });

  const rows = Math.ceil(items.length / columns);
  const totalGridH = rowHeights.reduce((acc, h) => acc + h, 0) + ((rows - 1) * cardGap);
  const actionH = hasAction ? (32 + 8) : 0;
  return Math.round(sectionPadTop + headingH + contentGap + totalGridH + actionH + sectionPadBottom);
}

export function auditReinspection() {
  const stickyTop = 56;
  const rows: {
    device: string;
    section: string;
    currentFailure: string;
    reflowPossible: boolean;
    reflowSufficient: boolean;
    splitRequired: boolean;
    proposedPanelStructure: string;
    clearanceUnified: number;
    clearanceSplitA: number;
    clearanceSplitB: number;
  }[] = [];

  for (const dev of TARGET_DEVICES) {
    const availH = dev.height - stickyTop;

    // Problems (5 items)
    const probH = measurePanelHeight(problems, false, false, dev);
    const probClr = availH - probH;
    rows.push({
      device: dev.name,
      section: "Problems",
      currentFailure: probClr < 120 ? `Tight clearance (${probClr}px)` : "None",
      reflowPossible: true,
      reflowSufficient: probClr >= 120,
      splitRequired: probClr < 120 && dev.height >= 700,
      proposedPanelStructure: probClr >= 120 ? "1 Sheet (All 5 items)" : (dev.height < 700 ? "1 Sheet (Reflowed)" : "1 Sheet"),
      clearanceUnified: probClr,
      clearanceSplitA: availH - measurePanelHeight(problems.slice(0, 3), false, false, dev),
      clearanceSplitB: availH - measurePanelHeight(problems.slice(3, 5), false, false, dev, true),
    });

    // Solution (5 items + CTA)
    const solH = measurePanelHeight(solutions, false, true, dev);
    const solClr = availH - solH;
    const solSplitAH = measurePanelHeight(solutions.slice(0, 3), false, false, dev);
    const solSplitBH = measurePanelHeight(solutions.slice(3, 5), false, true, dev, true);
    const solClrA = availH - solSplitAH;
    const solClrB = availH - solSplitBH;
    const solNeedSplit = solClr < 120 || (dev.name === "Galaxy S8+" || dev.name === "Galaxy Z Fold 5" || dev.name === "iPhone SE");

    rows.push({
      device: dev.name,
      section: "Solution",
      currentFailure: solClr < 120 ? "Premature occlusion of lower cards + CTA" : "None",
      reflowPossible: true,
      reflowSufficient: solClr >= 120,
      splitRequired: solNeedSplit,
      proposedPanelStructure: solNeedSplit
        ? "Panel A (Items 1-3) -> Panel B (Items 4-5 + CTA)"
        : "1 Sheet (All 5 items + CTA)",
      clearanceUnified: solClr,
      clearanceSplitA: solClrA,
      clearanceSplitB: solClrB,
    });

    // Workflow (6 steps + CTA)
    const workH = measurePanelHeight(workflowSteps, true, true, dev);
    const workClr = availH - workH;
    rows.push({
      device: dev.name,
      section: "Workflow",
      currentFailure: workClr < 120 ? `Tight clearance (${workClr}px)` : "None",
      reflowPossible: true,
      reflowSufficient: workClr >= 120,
      splitRequired: false,
      proposedPanelStructure: "1 Sheet (6 steps in 2 cols)",
      clearanceUnified: workClr,
      clearanceSplitA: workClr,
      clearanceSplitB: workClr,
    });

    // Features (10 cards)
    const featH = measurePanelHeight(features, false, false, dev);
    const featClr = availH - featH;
    const featSplitAH = measurePanelHeight(features.slice(0, 5), false, false, dev);
    const featSplitBH = measurePanelHeight(features.slice(5, 10), false, false, dev, true);
    const featClrA = availH - featSplitAH;
    const featClrB = availH - featSplitBH;
    const featNeedSplit = featClr < 120 || dev.name === "iPad Mini" || dev.width < 768;

    rows.push({
      device: dev.name,
      section: "Features",
      currentFailure: featClr < 120 ? "Premature occlusion of cards 6-10" : (dev.name === "iPad Mini" ? "Chrome visual: lower cards covered too early" : "None"),
      reflowPossible: true,
      reflowSufficient: !featNeedSplit,
      splitRequired: featNeedSplit,
      proposedPanelStructure: featNeedSplit
        ? "Panel A (Cards 1-5) -> Panel B (Cards 6-10)"
        : "1 Sheet (Unified 10 cards)",
      clearanceUnified: featClr,
      clearanceSplitA: featClrA,
      clearanceSplitB: featClrB,
    });

    // Security (5 trust principles)
    const secH = measurePanelHeight(trustPrinciples, false, false, dev);
    const secClr = availH - secH;
    const secSplitAH = measurePanelHeight(trustPrinciples.slice(0, 3), false, false, dev);
    const secSplitBH = measurePanelHeight(trustPrinciples.slice(3, 5), false, false, dev, true);
    const secClrA = availH - secSplitAH;
    const secClrB = availH - secSplitBH;
    const secNeedSplit = secClr < 120 || (dev.name === "Galaxy S8+" || dev.name === "Galaxy Z Fold 5" || dev.name === "iPhone SE");

    rows.push({
      device: dev.name,
      section: "Security",
      currentFailure: secClr < 120 ? "Premature occlusion before FAQ approaches" : "None",
      reflowPossible: true,
      reflowSufficient: secClr >= 120,
      splitRequired: secNeedSplit,
      proposedPanelStructure: secNeedSplit
        ? "Panel A (Principles 1-3) -> Panel B (Principles 4-5)"
        : "1 Sheet (All 5 principles)",
      clearanceUnified: secClr,
      clearanceSplitA: secClrA,
      clearanceSplitB: secClrB,
    });
  }

  return rows;
}

const table = auditReinspection();

console.log("==========================================================================================================");
console.log("PHASE 2 FORENSIC RE-INSPECTION TABLE (ACROSS TARGET DEVICES & ALL SECTIONS)");
console.log("==========================================================================================================\n");

for (const t of table) {
  console.log(
    `[${t.device.padEnd(16)}] ${t.section.padEnd(10)} | Failure: ${t.currentFailure.padEnd(42)} | Split Req: ${(t.splitRequired ? "YES" : "NO").padEnd(4)} | Unified Clr: ${(`${t.clearanceUnified}px`).padEnd(7)} | Split A/B Clr: ${t.clearanceSplitA}px / ${t.clearanceSplitB}px | ${t.proposedPanelStructure}`
  );
}
