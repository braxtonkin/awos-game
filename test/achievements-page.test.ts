import { expect, test } from "vitest";
import { openPage } from "./page.ts";

test("mining wood announces the achievement and the toast expires after five ticks", () => {
  const { page } = openPage();
  document.querySelector<HTMLButtonElement>('[data-resource="wood"] button')?.click();
  expect(document.querySelector(".toast")?.textContent).toBe("Achievement earned: First log");
  expect(document.querySelector('[data-section="achievements"]')?.textContent).toContain("Earned 1 of 10");
  for (let i = 0; i < 5; i += 1) page.tick();
  expect(document.querySelector(".toast")?.textContent).toBeUndefined();
});
