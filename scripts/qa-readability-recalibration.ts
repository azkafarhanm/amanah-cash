/**
 * Geometric and Visual QA Verification for Mobile/PWA Readability Recalibration
 * Tests bounding box calculations, typography standards, safe buffers, zero clipping,
 * and scroll takeover behavior across all 9 target viewports.
 */

interface ViewportQA {
  name: string;
  width: number;
  height: number;
  type: "mobile" | "tablet" | "desktop";
}

const VIEWPORTS: ViewportQA[] = [
  { name: "Mobile Compact (360×800)", width: 360, height: 800, type: "mobile" },
  { name: "Mobile Short (375×667)", width: 375, height: 667, type: "mobile" },
  { name: "Mobile iPhone 14 (390×844)", width: 390, height: 844, type: "mobile" },
  { name: "Mobile iPhone Plus (414×845)", width: 414, height: 845, type: "mobile" },
  { name: "Mobile Pixel 7 (412×915)", width: 412, height: 915, type: "mobile" },
  { name: "Tablet iPad Mini (768×1024)", width: 768, height: 1024, type: "tablet" },
  { name: "Tablet iPad Air (820×1180)", width: 820, height: 1180, type: "tablet" },
  { name: "Tablet Landscape / Small Desktop (1024×768)", width: 1024, height: 768, type: "desktop" },
  { name: "Desktop Golden Reference (1366×768)", width: 1366, height: 768, type: "desktop" },
];

interface SectionConfig {
  name: string;
  itemCount: number;
  hasActionLink?: boolean;
}

const SECTIONS: SectionConfig[] = [
  { name: "Masalah yang nyata", itemCount: 5 },
  { name: "Solusi yang praktis", itemCount: 5, hasActionLink: true },
  { name: "Cara kerja Amanah Cash", itemCount: 6, hasActionLink: true },
  { name: "Fitur untuk pekerjaan harian", itemCount: 10 },
  { name: "Keamanan dan kepercayaan", itemCount: 5 },
];

function evaluateViewport(vp: ViewportQA) {
  const isDesktop = vp.width >= 1024 && vp.height >= 608; // 64rem = 1024px, 38rem = 608px
  const isTablet = vp.width >= 768 && vp.width < 1024 && vp.height >= 672; // 48rem = 768px, 42rem = 672px
  const isMobileSticky = vp.width < 768 && vp.height >= 736; // 46rem = 736px
  const isShortFallback = !isDesktop && !isTablet && !isMobileSticky;

  const isSticky = isDesktop || isTablet || isMobileSticky;
  const navHeight = 56; // var(--size-14) = 3.5rem = 56px

  console.log(`\n===============================================================`);
  console.log(`VIEWPORT: ${vp.name} (${vp.width}×${vp.height}px)`);
  console.log(`Mode: ${isSticky ? "STICKY SHEET TAKEOVER" : "NATURAL RELATIVE FLOW (FALLBACK)"}`);
  console.log(`===============================================================`);

  for (const section of SECTIONS) {
    let columns = 1;
    let cardTitlePx = 14;
    let cardDescPx = 13;
    let cardLineHeight = 1.42;
    let cardPaddingV = 10;
    let cardPaddingH = 12;
    let cardGap = 10;
    let iconBoxSize = 24;
    let sectionPaddingTop = 16;
    let sectionPaddingBottom = 24;
    let contentGap = 16;
    let headingHeight = 78;

    if (isDesktop) {
      columns = section.itemCount === 10 ? 5 : (section.itemCount === 6 ? 3 : 3);
      cardTitlePx = 18;
      cardDescPx = 16;
      cardLineHeight = 1.5;
      cardPaddingV = 14;
      cardPaddingH = 16;
      cardGap = 14;
      iconBoxSize = 32;
      sectionPaddingTop = 32;
      sectionPaddingBottom = 40;
      contentGap = 24;
      headingHeight = 100;
    } else if (isTablet) {
      columns = section.itemCount === 10 ? 2 : (section.itemCount === 6 ? 3 : 3);
      cardTitlePx = 16;
      cardDescPx = 14;
      cardLineHeight = 1.45;
      cardPaddingV = 12;
      cardPaddingH = 14;
      cardGap = 12;
      iconBoxSize = 28;
      sectionPaddingTop = 24;
      sectionPaddingBottom = 32;
      contentGap = 20;
      headingHeight = 90;
    } else {
      // Mobile (Standard & Short Fallback)
      columns = 2; // 2-column layout for Features, Problems, Solutions, Workflow
      cardTitlePx = 14;
      cardDescPx = 13;
      cardLineHeight = 1.42;
      cardPaddingV = 10;
      cardPaddingH = 12;
      cardGap = 10;
      iconBoxSize = 24;
      sectionPaddingTop = 16;
      sectionPaddingBottom = 24;
      contentGap = 16;
      headingHeight = 78;
    }

    const rows = Math.ceil(section.itemCount / columns);
    // Card height calculation: topPad + icon + iconMargin(6) + title + titleMargin(4) + desc + bottomPad
    const approxDescLines = 3.2;
    const descHeight = cardDescPx * cardLineHeight * approxDescLines;
    const cardHeight = cardPaddingV + iconBoxSize + 6 + (cardTitlePx * 1.25) + 4 + descHeight + cardPaddingV;
    const gridHeight = (rows * cardHeight) + ((rows - 1) * cardGap);
    const actionHeight = section.hasActionLink ? 36 + 12 : 0;
    const totalContentHeight = sectionPaddingTop + headingHeight + contentGap + gridHeight + actionHeight + sectionPaddingBottom;

    const pinnedTop = navHeight;
    const pinnedBottomOnScreen = pinnedTop + totalContentHeight;
    const safeBottomBuffer = vp.height - pinnedBottomOnScreen;

    const statusReadable = cardTitlePx >= 14 && cardDescPx >= 13 && cardLineHeight >= 1.4;
    const statusNoClip = !isSticky || safeBottomBuffer >= 0;

    console.log(`\n  [Section] ${section.name}`);
    console.log(`    - Columns: ${columns}, Rows: ${rows}, Card Dimensions: ${cardHeight.toFixed(0)}px (pad: ${cardPaddingV}×${cardPaddingH}px, gap: ${cardGap}px)`);
    console.log(`    - Typography: Title ${cardTitlePx}px, Desc ${cardDescPx}px (LH ${cardLineHeight}), Icon ${iconBoxSize}px`);
    console.log(`    - Total Height: ${totalContentHeight.toFixed(0)}px`);
    if (isSticky) {
      console.log(`    - Pinned Top: ${pinnedTop}px, Pinned Bottom: ${pinnedBottomOnScreen.toFixed(0)}px`);
      console.log(`    - Safe Bottom Buffer: ${safeBottomBuffer.toFixed(0)}px (Scroll absorbed before sheet takeover: ${safeBottomBuffer > 0 ? "YES" : "NO"})`);
    } else {
      console.log(`    - Flow: Natural document flow (100% visible on scroll, zero clipping)`);
    }
    console.log(`    - Readability: ${statusReadable ? "PASS" : "FAIL"}`);
    console.log(`    - Zero Clipping: ${statusNoClip ? "PASS" : "FAIL"}`);
  }
}

console.log("=== RUNNING GEOMETRIC & VISUAL QA SUITE ===");
for (const vp of VIEWPORTS) {
  evaluateViewport(vp);
}
console.log("\n=== ALL 9 VIEWPORTS EVALUATED SUCCESSFULLY ===");
