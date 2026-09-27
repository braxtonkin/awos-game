import { expect, test } from "vitest";
import { openPage } from "./page.ts";

test("Furnace can be paused and resumed while Wooden axe has no pause control", () => {
  openPage(JSON.stringify({ version: 2, savedAt: 1, state: { amounts: { wood: 5 }, owned: { furnace: 1 } } }));
  const furnace = document.querySelector<HTMLElement>('[data-upgrade="furnace"]');
  expect(furnace?.querySelector("button:nth-of-type(2)")?.textContent).toBe("Pause");
  furnace?.querySelector<HTMLButtonElement>("button:nth-of-type(2)")?.click();
  expect(furnace?.querySelector("button:nth-of-type(2)")?.textContent).toBe("Resume");
  expect(furnace?.textContent).toContain("Paused");
  expect(document.querySelector('[data-upgrade="woodenAxe"] button:nth-of-type(2)')).toBeNull();
});
