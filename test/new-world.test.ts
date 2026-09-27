import { expect, test } from "vitest";
import { canStartNewWorld, emeraldsForNewWorld, mine, startNewWorld, tick } from "../src/game.ts";
import { decodeSave, serialize } from "../src/save.ts";
import { simulate } from "../sim/simulate.ts";
import { script } from "../sim/script.ts";
import { openPage } from "./page.ts";
import { stateWith } from "./state.ts";

test("new world gain thresholds, resets progress, and preserves achievements", () => {
  const state = stateWith({ amounts: { wood: 5 }, owned: { woodenAxe: 3 }, stats: { clicks: 0, ticks: 0, gathered: { wood: 100000 } }, achievements: ["firstLog"] });
  expect(emeraldsForNewWorld(state)).toBe(10);
  expect(emeraldsForNewWorld(stateWith({ stats: { clicks: 0, ticks: 0, gathered: { wood: 99999 } } }))).toBe(9);
  expect(canStartNewWorld(state)).toBe(true);
  expect(startNewWorld(state)).toMatchObject({ amounts: {}, owned: {}, achievements: ["firstLog"], prestige: { emeralds: 10, worlds: 1 } });
  const ineligible = stateWith({ stats: { clicks: 0, ticks: 0, gathered: { wood: 99999 } } });
  expect(startNewWorld(ineligible)).toBe(ineligible);
});

test("Emeralds double click and production power at ten", () => {
  expect(mine(stateWith({ prestige: { emeralds: 10, worlds: 1 } }), "wood").amounts.wood).toBe(2);
  expect(tick(stateWith({ owned: { woodenPickaxe: 1 }, prestige: { emeralds: 10, worlds: 1 } })).amounts.dirt).toBe(2);
});

test("save decoder keeps valid prestige and rejects invalid counts", () => {
  const source = JSON.parse(serialize(stateWith({ prestige: { emeralds: 4, worlds: 2 } }), 1)) as { state: { prestige: unknown } };
  const valid = decodeSave(JSON.stringify(source));
  expect(valid.kind === "loaded" ? valid.state.prestige : null).toEqual({ emeralds: 4, worlds: 2 });
  source.state.prestige = { emeralds: -1, worlds: Infinity };
  const invalid = decodeSave(JSON.stringify(source));
  expect(invalid.kind === "loaded" && invalid.state.prestige).toEqual({ emeralds: 0, worlds: 0 });
});

test("new world page confirms and redraws after reset", () => {
  const state = stateWith({ amounts: { wood: 5 }, stats: { clicks: 0, ticks: 0, gathered: { wood: 100000 } } });
  const { storage } = openPage(serialize(state, 1_000_000), { confirm: () => true });
  document.querySelector<HTMLButtonElement>('[data-section="newWorld"] button')!.click();
  const saved = decodeSave(storage.getItem("awos-game:save")!);
  expect(document.querySelector('[data-section="newWorld"]')?.textContent).toContain("Emeralds: 10");
  expect(document.querySelector('[data-section="newWorld"]')?.textContent).toContain("Bonus: +100% production and click power");
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("0");
  expect(saved.kind === "loaded" && saved.state.amounts.wood).toBeUndefined();
});

test("simulator waits without actions for a new-world threshold, then records world two", () => {
  const report = simulate({ ticks: 3100, clicksPerTick: 2, script });
  const reached = report.reached.find((item) => item.label === "newWorld");
  expect(reached?.world).toBe(2);
  expect(reached?.tick).toBeLessThanOrEqual(2990);
  expect(report.reached.filter((item) => item.tick > (reached?.tick ?? 0)).every((item) => item.world === 2)).toBe(true);
}, 15_000);
