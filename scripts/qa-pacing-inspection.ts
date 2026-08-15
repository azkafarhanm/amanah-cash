/**
 * Forensic Pacing & Scroll Trajectory Inspection Script
 * Audits all 9 specified viewport classes across all 6 transitions.
 * Evaluates: Content Height, Available Height, Runway, Approach Distance, Reading Runway, and Pacing Quality.
 */

export interface ViewportClass {
  name: string;
  device: string;
  width: number;
  height: number;
  category: "phone" | "foldable" | "tablet" | "desktop";
}

export const VIEWPORT_CLASSES: ViewportClass[] = [
  { name: "375×667", device: "iPhone SE", width: 375, height: 667, category: "phone" },
  { name: "360×740", device: "Galaxy S8+", width: 360, height: 740, category: "phone" },
  { name: "390×844", device: "iPhone 12/13/14", width: 390, height: 844, category: "phone" },
  { name: "412×915", device: "Pixel 7/8/9/10", width: 412, height: 915, category: "phone" },
  { name: "344×882", device: "Galaxy Z Fold 5", width: 344, height: 882, category: "foldable" },
  { name: "540×720", device: "Surface Duo", width: 540, height: 720, category: "foldable" },
  { name: "768×1024", device: "iPad Mini", width: 768, height: 1024, category: "tablet" },
  { name: "820×1180", device: "iPad Air", width: 820, height: 1180, category: "tablet" },
  { name: "1024×1366", device: "iPad Pro", width: 1024, height: 1366, category: "tablet" },
];

export interface SectionSpec {
  id: string;
  name: string;
  itemCount: number;
  hasActionLink?: boolean;
  isWorkflow?: boolean;
}

export const SECTION_SPECS: SectionSpec[] = [
  { id: "problems", name: "Problems (Masalah)", itemCount: 5 },
  { id: "solution", name: "Solution (Solusi)", itemCount: 5, hasActionLink: true },
  { id: "workflow", name: "Workflow (Cara Kerja)", itemCount: 6, hasActionLink: true, isWorkflow: true },
  { id: "features", name: "Features (Fitur)", itemCount: 10 },
  { id: "security", name: "Security (Keamanan)", itemCount: 5 },
];

export interface TransitionInspection {
  fromSection: string;
  toSection: string;
  fromHContent: number;
  availableH: number;
  approachDistance: number;
  readingRunway: number;
  pacingQuality: "EXCELLENT" | "COMFORTABLE" | "TIGHT" | "PREMATURE_COVER";
  trajectoryNotes: string;
}

export function runFullInspection(layoutType: "current" | "calibrated"): Record<string, TransitionInspection[]> {
  const allTransitions: Record<string, TransitionInspection[]> = {};
  const stickyTop = 56;

  for (const vp of VIEWPORT_CLASSES) {
    const isDesktop = vp.width >= 1024 && vp.height >= 608;
    const isTablet = vp.width >= 768 && vp.width < 1024;
    const isMobile = vp.width < 768;

    const availableHeight = vp.height - stickyTop;
    const containerPad = isMobile ? 32 : 48;
    const contentWidth = Math.min(vp.width - containerPad, isDesktop ? 1200 : vp.width);

    // Runway bonus:
    // in current: mobile = 96px (6rem), tablet = 128px (8rem), desktop = 192px (12rem)
    // in calibrated: mobile = 192px (12rem), tablet = 192px (12rem), desktop = 192px (12rem)
    const runwayBonus = layoutType === "calibrated" ? 192 : (isDesktop ? 192 : (isTablet ? 128 : 96));
    const runwayTotal = vp.height + runwayBonus;

    const sectionHeights: Record<string, number> = {};

    for (const section of SECTION_SPECS) {
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
        columns = section.itemCount === 10 ? 5 : 3;
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
        columns = section.itemCount === 10 ? 2 : 3;
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
        columns = 2;
        if (section.id === "features") {
          if (layoutType === "calibrated") {
            // Horizontal / ultra-calibrated card layout
            cardPadV = 6;
            cardPadH = 8;
            iconBox = 20;
            iconMargin = 4;
            titlePx = 13.5;
            titleMargin = 2;
            descPx = 12.5;
            descLineHeight = 1.35;
            cardGap = 6;
            sectionPadTop = 12;
            sectionPadBottom = 16;
            contentGap = 12;
            headingH = 64;
          } else {
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
        }
      }

      const rows = Math.ceil(section.itemCount / columns);
      const totalColGaps = (columns - 1) * cardGap;
      const cardWidth = Math.floor((contentWidth - totalColGaps) / columns);

      let cardHeight = 0;
      if (section.isWorkflow) {
        const approxDescLines = cardWidth < 200 ? 3.2 : (cardWidth < 300 ? 2.3 : 2);
        const descH = descPx * descLineHeight * approxDescLines;
        cardHeight = cardPadV + (titlePx * 1.25) + titleMargin + descH + cardPadV;
        cardHeight = Math.max(cardHeight, cardPadV + iconBox + cardPadV);
      } else {
        const approxDescLines = cardWidth < 160 ? 3.5 : (cardWidth < 220 ? 3 : (cardWidth < 320 ? 2.5 : 2));
        const descH = descPx * descLineHeight * approxDescLines;
        cardHeight = cardPadV + iconBox + iconMargin + (titlePx * 1.25) + titleMargin + descH + cardPadV;
      }

      const gridH = (rows * cardHeight) + ((rows - 1) * cardGap);
      const actionH = section.hasActionLink ? (36 + 12) : 0;
      const contentHeight = Math.round(sectionPadTop + headingH + contentGap + gridH + actionH + sectionPadBottom);
      sectionHeights[section.id] = contentHeight;
    }

    const transitions: TransitionInspection[] = [];
    const transitionPairs = [
      { from: "Hero", to: "Problems", fromId: "hero" },
      { from: "Problems", to: "Solution", fromId: "problems" },
      { from: "Solution", to: "Workflow", fromId: "solution" },
      { from: "Workflow", to: "Features", fromId: "workflow" },
      { from: "Features", to: "Security", fromId: "features" },
      { from: "Security", to: "FAQ", fromId: "security" },
    ];

    for (const pair of transitionPairs) {
      const fromH = pair.fromId === "hero" ? availableHeight : (sectionHeights[pair.fromId] || 500);
      const approachDistance = availableHeight - fromH;
      const readingRunway = runwayTotal - fromH;

      let pacingQuality: "EXCELLENT" | "COMFORTABLE" | "TIGHT" | "PREMATURE_COVER" = "COMFORTABLE";
      let trajectoryNotes = "";

      if (approachDistance < 80 && vp.height < 700) {
        pacingQuality = "PREMATURE_COVER";
        trajectoryNotes = `Tight height (${vp.height}px): incoming sheet approaches too quickly (${approachDistance}px). Best in natural cascade.`;
      } else if (approachDistance < 100) {
        pacingQuality = "TIGHT";
        trajectoryNotes = `Approach distance ${approachDistance}px is tight. Generous runway (${readingRunway}px) provides reading buffer.`;
      } else if (approachDistance >= 200) {
        pacingQuality = "EXCELLENT";
        trajectoryNotes = `Generous approach distance (${approachDistance}px) & ${readingRunway}px reading runway: smooth, natural takeover.`;
      } else {
        pacingQuality = "COMFORTABLE";
        trajectoryNotes = `Approach distance ${approachDistance}px meets guardrail. Reading runway ${readingRunway}px is well-paced.`;
      }

      transitions.push({
        fromSection: pair.from,
        toSection: pair.to,
        fromHContent: fromH,
        availableH: availableHeight,
        approachDistance,
        readingRunway,
        pacingQuality,
        trajectoryNotes,
      });
    }

    allTransitions[`${vp.device} (${vp.name})`] = transitions;
  }

  return allTransitions;
}

if (process.argv[1] && process.argv[1].endsWith("qa-pacing-inspection.ts")) {
  console.log("==========================================================================================================");
  console.log("FORENSIC TRANSITION-BY-TRANSITION PACING INSPECTION (ALL 9 VIEWPORTS × 6 TRANSITIONS)");
  console.log("==========================================================================================================\n");

  const currentResults = runFullInspection("current");

  for (const [vpName, transitions] of Object.entries(currentResults)) {
    console.log(`\n----------------------------------------------------------------------------------------------------------`);
    console.log(`DEVICE: ${vpName}`);
    console.log(`----------------------------------------------------------------------------------------------------------`);
    console.log(
      `  ${"Transition".padEnd(24)} | ${"H_content".padEnd(9)} | ${"ApproachDist".padEnd(12)} | ${"ReadRunway".padEnd(10)} | ${"Pacing Quality".padEnd(15)} | ${"Trajectory Notes"}`
    );
    console.log(`  ${"-".repeat(24)}-+-${"-".repeat(9)}-+-${"-".repeat(12)}-+-${"-".repeat(10)}-+-${"-".repeat(15)}-+---------------------------------------------------`);
    for (const t of transitions) {
      const transName = `${t.fromSection} → ${t.toSection}`;
      const hCont = `${t.fromHContent}px`;
      const appDist = `${t.approachDistance}px`;
      const rRun = `${t.readingRunway}px`;
      console.log(
        `  ${transName.padEnd(24)} | ${hCont.padEnd(9)} | ${appDist.padEnd(12)} | ${rRun.padEnd(10)} | ${t.pacingQuality.padEnd(15)} | ${t.trajectoryNotes}`
      );
    }
  }
}
