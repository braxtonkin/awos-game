import { expect, test } from "vitest";
import { openPage } from "./page.ts";

test("new game shows the full achievement count", () => {
  openPage();
  expect(document.querySelector('[data-section="achievements"]')?.textContent).toContain("Earned 0 of 20");
});

test("mining wood announces the achievement and the toast expires after five ticks", () => {
  const { page } = openPage();
  document.querySelector<HTMLButtonElement>('[data-resource="wood"] button')?.click();
  expect(document.querySelector(".toast")?.textContent).toBe("Achievement earned: First log");
  expect(document.querySelector('[data-section="achievements"]')?.textContent).toContain("Earned 1 of 20");
  for (let i = 0; i < 5; i += 1) page.tick();
  expect(document.querySelector(".toast")?.textContent).toBeUndefined();
});
