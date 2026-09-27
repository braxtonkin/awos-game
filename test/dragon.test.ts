import { expect, test } from "vitest";
import { attack, tick, emeraldsForNewWorld, startNewWorld, earnAchievements } from "../src/game.ts";
import { upgrades } from "../src/upgrades.ts";
import { upgradeDetails } from "../src/format.ts";
import { initialState } from "../src/game.ts";
import { stateWith } from "./state.ts";
import { decodeSave } from "../src/save.ts";

test("dragon attacks and golems deal their defined damage", () => {
  expect(attack(stateWith({ owned: { end: 1, netheritePickaxe: 1 } })).dragonHealth).toBe(199840);
  const unchanged = stateWith({});
  expect(attack(unchanged)).toBe(unchanged);
  expect(tick(stateWith({ owned: { end: 1, ironGolem: 2 } })).dragonHealth).toBe(199900);
  expect(attack(stateWith({ owned: { end: 1 }, dragonHealth: 5 })).dragonHealth).toBe(0);
});

test("defeat rewards emeralds, resets the world, and earns dragonSlayer", () => {
  const state = stateWith({ dragonHealth: 0, stats: { ...initialState.stats, gathered: { dirt: 100000 } } });
  expect(emeraldsForNewWorld(state)).toBe(20);
  expect(startNewWorld(state).dragonHealth).toBe(200000);
  expect(earnAchievements(state).achievements).toEqual(["stockpile", "dragonSlayer"]);
});

test("iron golem catalog and details are literal", () => {
  expect(upgrades.at(-1)).toEqual({ id: "ironGolem", name: "Iron golem", cost: { ironIngot: 3000, endStone: 500 }, perTick: {}, uses: undefined });
  expect(upgradeDetails(upgrades.at(-1)!, { ironIngot: 3000, endStone: 500 })).toEqual(["Cost: 3K Iron ingot, 500 End stone", "Damage: 50 per second to the Ender Dragon"]);
});

test("save decoder defaults and clamps dragon health", () => {
  const health = (text: string) => { const save = decodeSave(text); return save.kind === "loaded" ? save.state.dragonHealth : -1; };
  expect(health('{"version":2,"state":{}}')).toBe(200000);
  expect(health('{"version":2,"state":{"dragonHealth":250000}}')).toBe(200000);
  expect(health('{"version":2,"state":{"dragonHealth":-3}}')).toBe(0);
});
