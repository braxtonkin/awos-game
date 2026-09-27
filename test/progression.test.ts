import { expect, test } from "vitest";
import { buy, canBuy, canCraft, canMine, clickPower, costOf, craft, initialState, mine, productionMultiplier, tick, zoneReached } from "../src/game.ts";
import { recipes } from "../src/recipes.ts";
import { tools } from "../src/tools.ts";
import { zones } from "../src/zones.ts";
import { loadSave } from "../src/save.ts";

test("catalogs expose the ordered entries", () => {
  expect(tools.map(({ id }) => id)).toEqual(["stonePickaxe", "ironPickaxe"]);
  expect(zones.map(({ id }) => id)).toEqual(["surface", "caves"]);
  expect(recipes.map(({ id }) => id)).toEqual(["torch", "ironIngot"]);
});

test("purchase costs and tool purchases", () => {
  expect(costOf({ amounts: {}, owned: { woodenAxe: 3 } }, "woodenAxe")).toEqual({ wood: 15 });
  expect(costOf({ amounts: {}, owned: {} }, "caves")).toEqual({ torch: 400, stone: 1500 });
  expect(buy({ amounts: { stone: 60, wood: 40 }, owned: {} }, "stonePickaxe")).toEqual({ amounts: { stone: 0, wood: 0 }, owned: { stonePickaxe: 1 } });
  expect(buy({ amounts: { stone: 60, wood: 40 }, owned: { stonePickaxe: 1 } }, "stonePickaxe")).toEqual({ amounts: { stone: 60, wood: 40 }, owned: { stonePickaxe: 1 } });
});

test("zones require tools and are reached once purchased", () => {
  expect(canBuy({ amounts: { torch: 400, stone: 1500 }, owned: {} }, "caves")).toBe(false);
  expect(buy({ amounts: { torch: 400, stone: 1500 }, owned: {} }, "caves")).toEqual({ amounts: { torch: 400, stone: 1500 }, owned: {} });
  const entered = buy({ amounts: { torch: 400, stone: 1500 }, owned: { stonePickaxe: 1 } }, "caves");
  expect(entered).toEqual({ amounts: { torch: 0, stone: 0 }, owned: { stonePickaxe: 1, caves: 1 } });
  expect(zoneReached(initialState, "surface")).toBe(true);
  expect(zoneReached(entered, "caves")).toBe(true);
});

test("mining respects zones and tool click power", () => {
  expect(mine(initialState, "ironIngot")).toBe(initialState);
  expect(mine(initialState, "ironOre").amounts).toEqual({ ironOre: 1 });
  expect(canMine(initialState, "wood")).toBe(true);
  expect(mine({ amounts: {}, owned: { stonePickaxe: 1 } }, "wood").amounts).toEqual({ wood: 2 });
  expect(mine({ amounts: {}, owned: { stonePickaxe: 1, ironPickaxe: 1 } }, "wood").amounts).toEqual({ wood: 3 });
  expect(clickPower({ amounts: {}, owned: {} })).toBe(1);
  expect(productionMultiplier(initialState, "wood")).toBe(1);
});

test("ticks apply the production multiplier", () => {
  expect(tick({ amounts: {}, owned: { woodenAxe: 2 } })).toEqual({ amounts: { wood: 2 }, owned: { woodenAxe: 2 } });
});

test("crafting consumes inputs and produces outputs", () => {
  expect(canCraft({ amounts: { coal: 1, wood: 1 }, owned: {} }, "torch")).toBe(true);
  expect(craft({ amounts: { coal: 1, wood: 1 }, owned: {} }, "torch").amounts).toEqual({ coal: 0, wood: 0, torch: 4 });
  const insufficient = { amounts: { coal: 1 }, owned: {} } as const;
  expect(craft(insufficient, "torch")).toBe(insufficient);
  expect(craft({ amounts: { ironOre: 2, coal: 1 }, owned: {} }, "ironIngot").amounts).toEqual({ ironOre: 1, coal: 0, ironIngot: 1 });
});

test("save loading retains tool and zone counts", () => {
  expect(loadSave('{"amounts":{},"owned":{"stonePickaxe":1,"caves":1}}').state.owned).toEqual({ stonePickaxe: 1, caves: 1 });
});
