/**
 * Adaptive Physical Sheet Takeover QA Verification Script
 * Validates the complete Continuous Physical Sheet Takeover architecture:
 * Mobile (< 768px): Problems A (z1) -> Problems B (z2) -> Solution A (z3) -> Solution B (z4) -> Workflow A (z5) -> Workflow B (z6) -> Features A (z7) -> Features B (z8) -> Security A (z9) -> Security B (z10) -> FAQ (z11) -> Final CTA (z12)
 * Tablet (768px - 1023px): Problems (z1) -> Solution (z3) -> Workflow (z5) -> Features A (z7) -> Features B (z8) -> Security (z9) -> FAQ (z11) -> Final CTA (z12)
 * Desktop (>= 1024px): Problems (z1) -> Solution (z3) -> Workflow (z5) -> Features (z7) -> Security (z9) -> FAQ (z11) -> Final CTA (z12)
 * Evaluates: Content Height, Settled Bottom, Full Content Fit, Clearance, Reading Runway, Occlusion Status, and Trajectory Quality across all 11 viewports.
 */

import { problems, solutions, workflowSteps, features, trustPrinciples } from "../src/components/landing/landing-content";

export interface ViewportSpec {
  id: string;
  name: string;
  device: string;
  width: number;
  height: number;
  category: "phone" | "foldable" | "tablet" | "desktop";
}

export const ALL_VIEWPORTS: ViewportSpec[] = [
  { id: "375x667", name: "375×667", device: "iPhone SE", width: 375, height: 667, category: "phone" },
  { id: "360x740", name: "360×740", device: "Galaxy S8+", width: 360, height: 740, category: "phone" },
  { id: "540x720", name: "540×720", device: "Surface Duo", width: 540, height: 720, category: "foldable" },
  { id: "344x882", name: "344×882", device: "Galaxy Z Fold 5", width: 344, height: 882, category: "foldable" },
  { id: "390x844", name: "390×844", device: "iPhone 12/13/14", width: 390, height: 844, category: "phone" },
  { id: "412x915", name: "412×915", device: "Pixel 7/8/9", width: 412, height: 915, category: "phone" },
  { id: "768x1024", name: "768×1024", device: "iPad Mini", width: 768, height: 1024, category: "tablet" },
  { id: "820x1180", name: "820×1180", device: "iPad Air", width: 820, height: 1180, category: "tablet" },
  { id: "1024x768", name: "1024×768", device: "Tablet Landscape", width: 1024, height: 768, category: "desktop" },
  { id: "1024x1366", name: "1024×1366", device: "iPad Pro Portrait", width: 1024, height: 1366, category: "tablet" },
  { id: "1366x768", name: "1366×768", device: "Desktop Golden Reference", width: 1366, height: 768, category: "desktop" },
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

export function measureItemsHeight(
  items: readonly { title: string; description: string; icon?: string }[],
  isWorkflow: boolean,
  hasAction: boolean,
  vp: ViewportSpec,
  isContinuationPanel: boolean = false
): number {
  const isDesktop = vp.width >= 1024 && vp.height >= 608;
  const isTablet = vp.width >= 768 && vp.width < 1024;
  const isMobile = vp.width < 768;

  const containerPad = isMobile ? 32 : 48;
  const contentWidth = Math.min(vp.width - containerPad, isDesktop ? 1200 : vp.width);

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
  let headingH = isContinuationPanel ? 44 : 54;

  if (isDesktop) {
    columns = items.length === 10 ? 5 : 3;
    cardPadV = 14;
    cardPadH = 16;
    iconBox = 32;
    iconMargin = 10;
    titlePx = 18;
    titleMargin = 6;
    descPx = 16;
    descLineHeight = 1.5;
    cardGap = 14;
    sectionPadTop = 32;
    sectionPadBottom = 40;
    contentGap = 24;
    headingH = 104;
  } else if (isTablet) {
    columns = items.length === 10 ? 2 : 3;
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

export interface TransitionVerification {
  viewport: ViewportSpec;
  transition: string;
  fromHeight: number;
  availableHeight: number;
  settledSectionBottom: number;
  fullContentFit: boolean;
  clearance: number;
  readingRunway: number;
  firstMeaningfulOcclusion: number;
  mode: "STICKY TAKEOVER" | "NATURAL PHYSICAL CASCADE";
  occlusion: boolean;
  notes: string;
}

export function runComprehensiveVerification(): TransitionVerification[] {
  const verifications: TransitionVerification[] = [];
  const stickyTop = 56;

  for (const vp of ALL_VIEWPORTS) {
    const isDesktop = vp.width >= 1024 && vp.height >= 608;
    const isTablet = vp.width >= 768 && vp.width < 1024 && vp.height >= 672;
    const isMobile = vp.width < 768;
    const isShortFallback = vp.height < (isMobile ? 576 : (isTablet ? 672 : 608));

    const availableHeight = vp.height - stickyTop;
    const runwayBonus = isDesktop ? 192 : (isTablet ? 128 : 192);
    const runwayTotal = vp.height + runwayBonus;

    let transitions: { name: string; fromH: number; fromSec: string; toSec: string }[] = [];

    if (isMobile) {
      const probAH = measureItemsHeight(problems.slice(0, 3), false, false, vp, false);
      const probBH = measureItemsHeight(problems.slice(3, 5), false, false, vp, true);
      const solAH = measureItemsHeight(solutions.slice(0, 3), false, false, vp, false);
      const solBH = measureItemsHeight(solutions.slice(3, 5), false, true, vp, true);
      const workAH = measureItemsHeight(workflowSteps.slice(0, 4), true, false, vp, false);
      const workBH = measureItemsHeight(workflowSteps.slice(4, 6), true, true, vp, true);
      const featAH = measureItemsHeight(features.slice(0, 5), false, false, vp, false);
      const featBH = measureItemsHeight(features.slice(5, 10), false, false, vp, true);
      const secAH = measureItemsHeight(trustPrinciples.slice(0, 3), false, false, vp, false);
      const secBH = measureItemsHeight(trustPrinciples.slice(3, 5), false, false, vp, true);

      transitions = [
        { name: "Problems A → Problems B", fromH: probAH, fromSec: "Problems A", toSec: "Problems B" },
        { name: "Problems B → Solution A", fromH: probBH, fromSec: "Problems B", toSec: "Solution A" },
        { name: "Solution A → Solution B", fromH: solAH, fromSec: "Solution A", toSec: "Solution B" },
        { name: "Solution B → Workflow A", fromH: solBH, fromSec: "Solution B", toSec: "Workflow A" },
        { name: "Workflow A → Workflow B", fromH: workAH, fromSec: "Workflow A", toSec: "Workflow B" },
        { name: "Workflow B → Features A", fromH: workBH, fromSec: "Workflow B", toSec: "Features A" },
        { name: "Features A → Features B", fromH: featAH, fromSec: "Features A", toSec: "Features B" },
        { name: "Features B → Security A", fromH: featBH, fromSec: "Features B", toSec: "Security A" },
        { name: "Security A → Security B", fromH: secAH, fromSec: "Security A", toSec: "Security B" },
        { name: "Security B → FAQ", fromH: secBH, fromSec: "Security B", toSec: "FAQ" },
      ];
    } else if (isTablet) {
      const probH = measureItemsHeight(problems, false, false, vp);
      const solH = measureItemsHeight(solutions, false, true, vp);
      const workH = measureItemsHeight(workflowSteps, true, true, vp);
      const featAH = measureItemsHeight(features.slice(0, 5), false, false, vp, false);
      const featBH = measureItemsHeight(features.slice(5, 10), false, false, vp, true);
      const secH = measureItemsHeight(trustPrinciples, false, false, vp);

      transitions = [
        { name: "Problems → Solution", fromH: probH, fromSec: "Problems", toSec: "Solution" },
        { name: "Solution → Workflow", fromH: solH, fromSec: "Solution", toSec: "Workflow" },
        { name: "Workflow → Features A", fromH: workH, fromSec: "Workflow", toSec: "Features A" },
        { name: "Features A → Features B", fromH: featAH, fromSec: "Features A", toSec: "Features B" },
        { name: "Features B → Security", fromH: featBH, fromSec: "Features B", toSec: "Security" },
        { name: "Security → FAQ", fromH: secH, fromSec: "Security", toSec: "FAQ" },
      ];
    } else {
      const probH = measureItemsHeight(problems, false, false, vp);
      const solH = measureItemsHeight(solutions, false, true, vp);
      const workH = measureItemsHeight(workflowSteps, true, true, vp);
      const featUnifiedH = measureItemsHeight(features, false, false, vp, false);
      const secH = measureItemsHeight(trustPrinciples, false, false, vp);

      transitions = [
        { name: "Problems → Solution", fromH: probH, fromSec: "Problems", toSec: "Solution" },
        { name: "Solution → Workflow", fromH: solH, fromSec: "Solution", toSec: "Workflow" },
        { name: "Workflow → Features", fromH: workH, fromSec: "Workflow", toSec: "Features" },
        { name: "Features → Security", fromH: featUnifiedH, fromSec: "Features", toSec: "Security" },
        { name: "Security → FAQ", fromH: secH, fromSec: "Security", toSec: "FAQ" },
      ];
    }

    for (const t of transitions) {
      const settledSectionBottom = stickyTop + t.fromH;
      const fullContentFit = settledSectionBottom <= vp.height;
      const clearance = availableHeight - t.fromH;
      const readingRunway = runwayTotal - t.fromH;
      const firstMeaningfulOcclusion = readingRunway;
      const mode = isShortFallback ? "NATURAL PHYSICAL CASCADE" : "STICKY TAKEOVER";
      
      // Verification condition: on sticky takeover, MUST satisfy full content fit AND clearance >= 120px (or reading runway >= 120px on desktop)
      const hasTakeoverComfort = isDesktop ? readingRunway >= 120 : clearance >= 120;
      const occlusion = mode === "STICKY TAKEOVER" && (!fullContentFit || !hasTakeoverComfort);
      let notes = "";

      if (isShortFallback) {
        notes = "Short viewport fallback -> Natural physical cascade (zero clipping)";
      } else if (fullContentFit && clearance >= 120) {
        notes = `100% Content Fit (${settledSectionBottom}px <= ${vp.height}px) & Clearance ${clearance}px >= 120px`;
      } else if (fullContentFit && hasTakeoverComfort) {
        notes = `100% Content Fit (${settledSectionBottom}px <= ${vp.height}px) & Reading Runway ${readingRunway}px >= 120px`;
      } else {
        notes = `FAIL: Content Fit ${fullContentFit ? "PASS" : "FAIL"}, Clearance ${clearance}px`;
      }

      verifications.push({
        viewport: vp,
        transition: t.name,
        fromHeight: t.fromH,
        availableHeight,
        settledSectionBottom,
        fullContentFit,
        clearance,
        readingRunway,
        firstMeaningfulOcclusion,
        mode,
        occlusion,
        notes,
      });
    }
  }

  return verifications;
}

const list = runComprehensiveVerification();

console.log("==========================================================================================================");
console.log("CONTINUOUS PHYSICAL SHEET TAKEOVER QA VERIFICATION (ALL 11 VIEWPORTS & TRANSITIONS)");
console.log("==========================================================================================================\n");

let currVp = "";
for (const v of list) {
  const vpTitle = `${v.viewport.device} (${v.viewport.name}) — Avail H: ${v.availableHeight}px [${v.mode}]`;
  if (vpTitle !== currVp) {
    currVp = vpTitle;
    console.log(`\n----------------------------------------------------------------------------------------------------------`);
    console.log(`DEVICE: ${vpTitle}`);
    console.log(`----------------------------------------------------------------------------------------------------------`);
    console.log(
      `  ${"Transition".padEnd(28)} | ${"From H".padEnd(8)} | ${"Fit (<=VpH)".padEnd(12)} | ${"Clearance".padEnd(10)} | ${"ReadRunway".padEnd(11)} | ${"Occlusion".padEnd(10)} | ${"Notes"}`
    );
    console.log(`  ${"-".repeat(28)}-+-${"-".repeat(8)}-+-${"-".repeat(12)}-+-${"-".repeat(10)}-+-${"-".repeat(11)}-+-${"-".repeat(10)}-+---------------------------------------------------`);
  }
  const fH = `${v.fromHeight}px`;
  const fit = v.fullContentFit ? "YES (PASS)" : "NO (FAIL)";
  const clr = `${v.clearance}px`;
  const rRun = `${v.readingRunway}px`;
  const occl = v.occlusion ? "YES (FAIL)" : "NO (PASS)";
  console.log(`  ${v.transition.padEnd(28)} | ${fH.padEnd(8)} | ${fit.padEnd(12)} | ${clr.padEnd(10)} | ${rRun.padEnd(11)} | ${occl.padEnd(10)} | ${v.notes}`);
}
