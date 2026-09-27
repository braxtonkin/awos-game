import { expect, test } from "vitest";
import { buyPerk, canStartNewWorld, catchUp, emeraldsForNewWorld, mine, rollEvent, startNewWorld, tick } from "../src/game.ts";
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
  expect(startNewWorld(state)).toMatchObject({ amounts: {}, owned: {}, achievements: ["firstLog"], prestige: { emeralds: 10, worlds: 1, perks: [] } });
  const ineligible = stateWith({ stats: { clicks: 0, ticks: 0, gathered: { wood: 99999 } } });
  expect(startNewWorld(ineligible)).toBe(ineligible);
});

test("Emeralds double click and production power at ten", () => {
  expect(mine(stateWith({ prestige: { emeralds: 10, worlds: 1, perks: [] } }), "wood").amounts.wood).toBe(2);
  expect(tick(stateWith({ owned: { woodenPickaxe: 1 }, prestige: { emeralds: 10, worlds: 1, perks: [] } })).amounts.dirt).toBe(2);
});

test("save decoder keeps valid prestige and rejects invalid counts", () => {
  const source = JSON.parse(serialize(stateWith({ prestige: { emeralds: 4, worlds: 2, perks: [] } }), 1)) as { state: { prestige: unknown } };
  const valid = decodeSave(JSON.stringify(source));
  expect(valid.kind === "loaded" ? valid.state.prestige : null).toEqual({ emeralds: 4, worlds: 2, perks: [] });
  source.state.prestige = { emeralds: -1, worlds: Infinity };
  const invalid = decodeSave(JSON.stringify(source));
  expect(invalid.kind === "loaded" && invalid.state.prestige).toEqual({ emeralds: 0, worlds: 0, perks: [] });
});

test("perks can be bought once for Emeralds", () => {
  const state = stateWith({ prestige: { emeralds: 10, worlds: 1, perks: [] } });
  expect(buyPerk(state, "stoneStart").prestige).toEqual({ emeralds: 7, worlds: 1, perks: ["stoneStart"] });
  const poor = stateWith({ prestige: { emeralds: 2, worlds: 1, perks: [] } });
  expect(buyPerk(poor, "stoneStart")).toBe(poor);
  const owned = stateWith({ prestige: { emeralds: 10, worlds: 1, perks: ["stoneStart"] } });
  expect(buyPerk(owned, "stoneStart")).toBe(owned);
});

test("perks affect new worlds, offline progress, events, and clicking", () => {
  const world = stateWith({ stats: { clicks: 0, ticks: 0, gathered: { wood: 100000 } }, prestige: { emeralds: 0, worlds: 1, perks: ["stoneStart", "headStart"] } });
  expect(startNewWorld(world).owned).toEqual({ stonePickaxe: 1, woodenAxe: 5, quarry: 2 });
  expect(startNewWorld(world).prestige.perks).toEqual(["stoneStart", "headStart"]);
  expect(catchUp(stateWith({ owned: { woodenPickaxe: 1 }, prestige: { ...stateWith({}).prestige, perks: ["nightShift"] } }), 20 * 60 * 60 * 1000).amounts.dirt).toBe(57600);
  expect(catchUp(stateWith({ owned: { woodenPickaxe: 1 } }), 20 * 60 * 60 * 1000).amounts.dirt).toBe(28800);
  expect(rollEvent(stateWith({ prestige: { ...stateWith({}).prestige, perks: ["lucky"] } }), 0.01, 0).event?.id).toBe("rain");
  expect(rollEvent(stateWith({}), 0.01, 0).event).toBeNull();
  expect(mine(stateWith({ prestige: { ...stateWith({}).prestige, perks: ["strongArm"] } }), "wood").amounts.wood).toBe(1.5);
});

test("new world page buys a perk and shows its owned state", () => {
  const { storage } = openPage(serialize(stateWith({ prestige: { emeralds: 10, worlds: 1, perks: [] } }), 1_000_000));
  document.querySelector<HTMLButtonElement>('[data-perk="stoneStart"] button')!.click();
  expect(document.querySelector('[data-section="newWorld"]')?.textContent).toContain("Emeralds: 7");
  expect(document.querySelector('[data-perk="stoneStart"] button')?.textContent).toBe("Owned");
  expect(decodeSave(storage.getItem("awos-game:save")!).kind).toBe("loaded");
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
