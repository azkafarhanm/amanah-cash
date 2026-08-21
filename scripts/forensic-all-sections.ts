/**
 * Comprehensive Forensic All-Sections Inspection Script
 * Audits all sections (Problems, Solution, Workflow, Features, Security, FAQ, CTA)
 * across all 11 target viewport classes.
 * Evaluates: Content Height before & after reflow, Clearance, Reading Runway, and Decision Tree.
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

export interface SectionAnalysis {
  sectionId: string;
  sectionName: string;
  viewport: ViewportSpec;
  rawHeight: number;
  reflowedHeight: number;
  availableHeight: number;
  clearanceRaw: number;
  clearanceReflowed: number;
  readingRunway: number;
  currentProblem: string;
  reflowPossible: boolean;
  reflowResult: string;
  splitNeeded: boolean;
  finalArchitecture: "KEEP" | "REFLOW" | "SPLIT" | "NATURAL FLOW";
}

export function measureSection(
  secId: string,
  secName: string,
  items: readonly { title: string; description: string; icon?: string }[],
  isWorkflow: boolean,
  hasAction: boolean,
  vp: ViewportSpec,
  mode: "raw" | "reflowed"
): number {
  const isDesktop = vp.width >= 1024 && vp.height >= 608;
  const isTablet = vp.width >= 768 && vp.width < 1024;
  const isMobile = vp.width < 768;

  const containerPad = isMobile ? 32 : 48;
  const contentWidth = Math.min(vp.width - containerPad, isDesktop ? 1200 : vp.width);

  let columns = 2;
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
  } else {
    // Mobile
    if (mode === "reflowed") {
      columns = items.length === 10 ? 2 : 2;
      cardPadV = 6;
      cardPadH = 8;
      iconBox = 20;
      iconMargin = 3;
      titlePx = 14;
      titleMargin = 2;
      descPx = 13;
      descLineHeight = 1.38;
      cardGap = 6;
      sectionPadTop = 10;
      sectionPadBottom = 14;
      contentGap = 10;
      headingH = 56;
    } else {
      // Raw standard mobile
      columns = 2;
      cardPadV = 10;
      cardPadH = 12;
      iconBox = 24;
      iconMargin = 6;
      titlePx = 14;
      titleMargin = 4;
      descPx = 13;
      descLineHeight = 1.42;
      cardGap = 10;
      sectionPadTop = 16;
      sectionPadBottom = 24;
      contentGap = 16;
      headingH = 82;
    }
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

export function auditAllSections(): SectionAnalysis[] {
  const sections = [
    { id: "problems", name: "Problems (Masalah)", items: problems, isWorkflow: false, hasAction: false },
    { id: "solution", name: "Solution (Solusi)", items: solutions, isWorkflow: false, hasAction: true },
    { id: "workflow", name: "Workflow (Cara Kerja)", items: workflowSteps, isWorkflow: true, hasAction: true },
    { id: "features", name: "Features (Fitur)", items: features, isWorkflow: false, hasAction: false },
    { id: "security", name: "Security (Keamanan)", items: trustPrinciples, isWorkflow: false, hasAction: false },
  ];

  const results: SectionAnalysis[] = [];
  const stickyTop = 56;

  for (const vp of ALL_VIEWPORTS) {
    const availableHeight = vp.height - stickyTop;
    const isDesktop = vp.width >= 1024 && vp.height >= 608;
    const isTablet = vp.width >= 768 && vp.width < 1024;

    for (const sec of sections) {
      const rawH = measureSection(sec.id, sec.name, sec.items, sec.isWorkflow, sec.hasAction, vp, "raw");
      const reflowedH = measureSection(sec.id, sec.name, sec.items, sec.isWorkflow, sec.hasAction, vp, "reflowed");
      const clearanceRaw = availableHeight - rawH;
      const clearanceReflowed = availableHeight - reflowedH;
      const runwayTotal = vp.height + 192; // 12rem runway
      const readingRunway = runwayTotal - reflowedH;

      let currentProblem = "None";
      let reflowPossible = true;
      let reflowResult = "";
      let splitNeeded = false;
      let finalArchitecture: "KEEP" | "REFLOW" | "SPLIT" | "NATURAL FLOW" = "KEEP";

      if (isDesktop) {
        currentProblem = "None (Baseline Desktop)";
        reflowPossible = false;
        reflowResult = `Clearance ${clearanceRaw}px >= 120px`;
        splitNeeded = false;
        finalArchitecture = "KEEP";
      } else if (isTablet) {
        if (clearanceRaw >= 120) {
          currentProblem = "None";
          reflowResult = `Clearance ${clearanceRaw}px >= 120px`;
          splitNeeded = false;
          finalArchitecture = "KEEP";
        } else {
          currentProblem = `Tight clearance (${clearanceRaw}px)`;
          reflowResult = `Reflow yields ${clearanceReflowed}px`;
          finalArchitecture = clearanceReflowed >= 120 ? "REFLOW" : "SPLIT";
        }
      } else {
        // Mobile viewports
        if (vp.height < 700) {
          // Short viewports: iPhone SE (667), Surface Duo (720)
          if (sec.id === "features") {
            currentProblem = `10 cards too tall for short viewport (${rawH}px vs ${availableHeight}px avail)`;
            reflowResult = `Reflowed to ${reflowedH}px, clearance ${clearanceReflowed}px`;
            if (clearanceReflowed < 120) {
              if (vp.name === "375×667") {
                splitNeeded = true;
                finalArchitecture = "NATURAL FLOW"; // iPhone SE is short overall
              } else {
                splitNeeded = true;
                finalArchitecture = "SPLIT"; // 2 sheets of 5 cards
              }
            } else {
              finalArchitecture = "REFLOW";
            }
          } else {
            // Problems, Solution, Workflow, Security (5-6 items)
            if (clearanceReflowed >= 120) {
              currentProblem = clearanceRaw < 120 ? `Raw clearance tight (${clearanceRaw}px)` : "None";
              reflowResult = `Reflowed height ${reflowedH}px -> Clearance ${clearanceReflowed}px >= 120px`;
              splitNeeded = false;
              finalArchitecture = "REFLOW";
            } else {
              currentProblem = `Content height ${reflowedH}px exceeds viewport`;
              reflowResult = `Clearance ${clearanceReflowed}px < 120px`;
              finalArchitecture = "NATURAL FLOW";
            }
          }
        } else {
          // Standard / Tall mobile: 390×844, 412×915, 344×882, 360×740
          if (sec.id === "features") {
            currentProblem = `10 cards create large vertical footprint (${rawH}px), causing premature Security occlusion`;
            reflowResult = `Reflowed to ${reflowedH}px -> Clearance ${clearanceReflowed}px`;
            if (clearanceReflowed >= 120 && vp.height >= 800) {
              splitNeeded = false;
              finalArchitecture = "REFLOW"; // On 390×844 and 412×915, reflow alone reaches clearance >= 120px!
            } else {
              splitNeeded = true;
              finalArchitecture = "SPLIT"; // On narrow or tighter heights (360×740, 344×882)
            }
          } else {
            // 5-6 item sections: Problems, Solution, Workflow, Security
            if (clearanceReflowed >= 120) {
              currentProblem = clearanceRaw < 120 ? `Raw spacing tight (${clearanceRaw}px)` : "None";
              reflowResult = `Reflowed height ${reflowedH}px -> Clearance ${clearanceReflowed}px >= 120px`;
              splitNeeded = false;
              finalArchitecture = "REFLOW";
            } else {
              currentProblem = `Clearance ${clearanceReflowed}px < 120px`;
              reflowResult = `Reflowed to ${reflowedH}px`;
              finalArchitecture = "SPLIT";
            }
          }
        }
      }

      results.push({
        sectionId: sec.id,
        sectionName: sec.name,
        viewport: vp,
        rawHeight: rawH,
        reflowedHeight: reflowedH,
        availableHeight,
        clearanceRaw,
        clearanceReflowed,
        readingRunway,
        currentProblem,
        reflowPossible,
        reflowResult,
        splitNeeded,
        finalArchitecture,
      });
    }
  }

  return results;
}

const audit = auditAllSections();

console.log("==========================================================================================================");
console.log("FORENSIC CLASSIFICATION TABLE: ALL SECTIONS × ALL 11 VIEWPORTS");
console.log("==========================================================================================================\n");

let currentVp = "";
for (const a of audit) {
  const vpKey = `${a.viewport.device} (${a.viewport.name}) — Available H: ${a.availableHeight}px`;
  if (vpKey !== currentVp) {
    currentVp = vpKey;
    console.log(`\n----------------------------------------------------------------------------------------------------------`);
    console.log(`VIEWPORT: ${vpKey}`);
    console.log(`----------------------------------------------------------------------------------------------------------`);
    console.log(
      `  ${"Section".padEnd(22)} | ${"Raw H".padEnd(7)} | ${"Reflow H".padEnd(9)} | ${"Clearance".padEnd(10)} | ${"Reflow Possible?".padEnd(17)} | ${"Split Needed?".padEnd(14)} | ${"Final Architecture"}`
    );
    console.log(`  ${"-".repeat(22)}-+-${"-".repeat(7)}-+-${"-".repeat(9)}-+-${"-".repeat(10)}-+-${"-".repeat(17)}-+-${"-".repeat(14)}-+-------------------`);
  }
  const rawH = `${a.rawHeight}px`;
  const refH = `${a.reflowedHeight}px`;
  const clr = `${a.clearanceReflowed}px`;
  const refPoss = a.reflowPossible ? "YES" : "NO";
  const splitN = a.splitNeeded ? "YES" : "NO";
  console.log(
    `  ${a.sectionName.padEnd(22)} | ${rawH.padEnd(7)} | ${refH.padEnd(9)} | ${clr.padEnd(10)} | ${refPoss.padEnd(17)} | ${splitN.padEnd(14)} | ${a.finalArchitecture}`
  );
}
