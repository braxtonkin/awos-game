import { expect, test } from "vitest";
import { buyMany, costOfMany, maxAffordable } from "../src/game.ts";
import { stateWith } from "./state.ts";
import { openPage } from "./page.ts";

test("upgrade batch costs sum rising prices", () => {
  expect(costOfMany(stateWith({}), "woodenAxe", 10)).toEqual({ wood: 308 });
  expect(costOfMany(stateWith({ owned: { woodenAxe: 5 } }), "woodenAxe", 10)).toEqual({ wood: 617 });
});

test("maximum affordable upgrade batch is correct", () => {
  expect(maxAffordable(stateWith({ amounts: { wood: 100 } }), "woodenAxe")).toBe(4);
  expect(maxAffordable(stateWith({ amounts: { wood: 1000 } }), "woodenAxe")).toBe(17);
});

test("buyMany pays and grants the whole batch or leaves state unchanged", () => {
  expect(buyMany(stateWith({ amounts: { wood: 100 } }), "woodenAxe", 4)).toMatchObject({ amounts: { wood: 24 }, owned: { woodenAxe: 4 } });
  const state = stateWith({ amounts: { wood: 100 } });
  expect(buyMany(state, "woodenAxe", 5)).toBe(state);
});

test("Max buys the affordable batch and updates the page", () => {
  openPage(JSON.stringify({ amounts: { wood: 100 }, owned: {} }));
  expect(document.querySelector('[data-section="upgrades"] button')?.getAttribute("aria-pressed")).toBe("true");
  [...document.querySelectorAll<HTMLButtonElement>('[data-section="upgrades"] button')].find((button) => button.textContent === "Max")?.click();
  const axe = document.querySelector<HTMLButtonElement>('[data-upgrade="woodenAxe"] button');
  expect(axe?.textContent).toBe("Buy max (4)");
  axe?.click();
  expect(document.querySelector('[data-upgrade="woodenAxe"]')?.textContent).toContain("Owned: 4");
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("24");
});
