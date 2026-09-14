/*
  Measures the contrast of the login wordmark against what is actually rendered
  behind it.

  Why this exists as a script rather than a test: the login screen's brand line
  sits under the pendant's light cone, and the cone is painted above it. The
  ground behind the words is therefore a composite of gradients that no amount
  of reading the stylesheet will tell you the colour of. Three separate defects
  on this screen were invisible from the source and only appeared once rendered.

  It is deliberately NOT part of `npm test`. Playwright is not a dependency of
  this project, and adding a browser to CI for one screen is not worth the build
  time or the flakiness. Install it once, locally, when you need to measure:

      npm i -g playwright && npx playwright install chromium

  Then, with the dev server running:

      npx tsx scripts/qa-auth-contrast.ts

  Run it after touching any of: --color-brand-accent, --color-brand-diamond,
  --auth-brand-scrim, --auth-brand-halo, --auth-spotlight-*, or the lamp's light
  cone. Those are the knobs that move these numbers.

  Thresholds come from docs/16-accessibility-guidelines.md §5: large text needs
  3:1. 4.5:1 is the target this screen aims for, to leave headroom for the
  gradient varying between viewports.
*/

// Marks this file as a module. Without it TypeScript treats every script in
// this directory as one shared global scope, and the names below collide with
// the other qa-* scripts.
export {};

const AUTH_BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:3000";

const AUTH_VIEWPORTS = [
  { name: "iphone-se  375x553", width: 375, height: 553 },
  { name: "pixel-9    412x760", width: 412, height: 760 },
  { name: "ipad-pro  1032x1376", width: 1032, height: 1376 }
];

const BRAND_WORDS: Array<{ label: string; selector: string }> = [
  { label: "Amanah", selector: '[class*="brandName"] > span:not([class])' },
  { label: "Cash", selector: '[class*="brandAccent"]' }
];

type AuthRgb = [number, number, number];

const srgbChannel = (value: number) => {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = ([r, g, b]: AuthRgb) =>
  0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);

const contrastRatio = (a: AuthRgb, b: AuthRgb) => {
  const [high, low] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

async function runAuthContrast() {
  let chromium;
  try {
    // Specifier held in a variable on purpose: playwright is not a dependency
    // of this project, so a literal import would fail typecheck for everyone
    // who has not installed it. This keeps `npm run typecheck` clean while the
    // catch below handles the runtime case.
    const playwrightModule = "playwright";
    ({ chromium } = await import(playwrightModule));
  } catch {
    console.error(
      [
        "Playwright is not installed, and it is not a dependency of this project.",
        "",
        "  npm i -g playwright && npx playwright install chromium",
        "",
        "Then run this script again."
      ].join("\n")
    );
    process.exit(1);
  }

  const browser = await chromium.launch();

  // A throwaway page used only to average the pixels of a screenshot.
  const analyser = await browser.newPage();
  await analyser.goto("about:blank");

  const averageRGB = async (buffer: Buffer): Promise<AuthRgb> =>
    analyser.evaluate(async (base64: string) => {
      const image = new Image();
      image.src = "data:image/png;base64," + base64;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let r = 0;
      let g = 0;
      let b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      const pixels = data.length / 4;
      return [Math.round(r / pixels), Math.round(g / pixels), Math.round(b / pixels)];
    }, buffer.toString("base64")) as Promise<AuthRgb>;

  const rows: Array<Record<string, string>> = [];
  let failures = 0;

  for (const theme of ["dark", "light"] as const) {
    for (const viewport of AUTH_VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 2,
        colorScheme: theme
      });

      await page.goto(`${AUTH_BASE_URL}/login`, { waitUntil: "networkidle" });
      await page.evaluate(
        (value: string) => document.documentElement.setAttribute("data-theme", value),
        theme
      );

      // The lamp never auto-ignites; until the cord is pulled the room is dark
      // and the wordmark is invisible. The cord exposes a keyboard path.
      const cord = page.getByLabel("Tarik untuk menyalakan lampu");
      if (await cord.count()) {
        await cord.first().focus();
        await cord.first().press("Enter");
      }
      await page.waitForTimeout(6000);

      for (const word of BRAND_WORDS) {
        const element = page.locator(word.selector).first();
        if (!(await element.count())) continue;

        const colour = await element.evaluate((node: Element) => getComputedStyle(node).color);
        const box = await element.boundingBox();
        if (!box) continue;

        // Hide the glyphs and shoot the same rectangle: what remains is the
        // ground the text is actually read against.
        await element.evaluate((node: HTMLElement) => {
          node.style.visibility = "hidden";
        });
        await page.waitForTimeout(150);
        const ground = await averageRGB(await page.screenshot({ clip: box }));
        await element.evaluate((node: HTMLElement) => {
          node.style.visibility = "";
        });

        const text = colour.match(/\d+/g)!.slice(0, 3).map(Number) as AuthRgb;
        const ratio = contrastRatio(text, ground);
        if (ratio < 3) failures += 1;

        rows.push({
          theme,
          viewport: viewport.name,
          word: word.label,
          text: `rgb(${text.join(",")})`,
          ground: `rgb(${ground.join(",")})`,
          ratio: `${ratio.toFixed(2)}:1`,
          "floor 3:1": ratio >= 3 ? "pass" : "FAIL",
          "target 4.5:1": ratio >= 4.5 ? "pass" : "under"
        });
      }

      await page.close();
    }
  }

  await browser.close();
  console.table(rows);

  if (failures > 0) {
    console.error(
      `\n${failures} measurement(s) below the 3:1 floor required by docs/16-accessibility-guidelines.md §5.`
    );
    process.exit(1);
  }
  console.log("\nEvery measurement clears the 3:1 floor.");
}

runAuthContrast().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
