import { chromium } from "playwright-core";
import { preview } from "vite";

const urlIndex = process.argv.indexOf("--url");
const suppliedUrl = urlIndex === -1 ? undefined : process.argv[urlIndex + 1];
const injectError = process.argv.includes("--inject-error");
let server: Awaited<ReturnType<typeof preview>> | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
let failed = false;
let currentStep = "open";

function fail(label: string, reason: string): void {
  if (!failed) {
    failed = true;
    console.error(`FAIL ${label}: ${reason}`);
  }
}

try {
  if (suppliedUrl === undefined) {
    server = await preview({ preview: { host: "127.0.0.1", port: 4173, strictPort: true } });
  }
  browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") {
      fail("console error", message.text());
    }
  });
  page.on("pageerror", (error) => fail("page error", error.message));

  const baseUrl = suppliedUrl ?? "http://127.0.0.1:4173";
  await page.goto(baseUrl);
  await page.getByRole("heading", { name: "Block Idle" }).waitFor();
  checkErrors();
  console.log("PASS open");

  if (injectError) {
    await page.evaluate(() => console.error("planted"));
    checkErrors();
  }

  currentStep = "mine 15 wood";
  const wood = page.locator("#resources li").filter({ has: page.locator(".name", { hasText: /^Wood$/ }) });
  for (let i = 0; i < 15; i += 1) {
    await wood.getByRole("button", { name: "Mine" }).click();
  }
  assertText(await wood.locator(".amount").textContent(), "15");
  checkErrors();
  console.log("PASS mine 15 wood");

  currentStep = "buy wooden axe";
  const axe = page.locator("#upgrades li").filter({ has: page.locator(".name", { hasText: /^Wooden axe$/ }) });
  await axe.getByRole("button", { name: "Buy" }).click();
  assertText(await axe.textContent(), "Owned: 1");
  checkErrors();
  console.log("PASS buy wooden axe");

  currentStep = "reload keeps progress";
  await page.reload();
  await page.getByRole("heading", { name: "Block Idle" }).waitFor();
  assertText(await axe.textContent(), "Owned: 1");
  checkErrors();
  console.log("PASS reload keeps progress");

  currentStep = "phone width 360";
  await page.setViewportSize({ width: 360, height: 740 });
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  if (scrollWidth > 360) {
    throw new Error(`document width is ${scrollWidth}px`);
  }
  checkErrors();
  console.log("PASS phone width 360");
} catch (error) {
  if (!failed) {
    const reason = error instanceof Error ? error.message : String(error);
    fail(currentStep, reason);
  }
  process.exitCode = 1;
} finally {
  await browser?.close();
  await server?.httpServer.close();
}

function checkErrors(): void {
  if (failed) {
    process.exitCode = 1;
    throw new Error("browser reported an error");
  }
}

function assertText(actual: string | null, expected: string): void {
  if (!actual?.includes(expected)) {
    throw new Error(`expected text to include ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
