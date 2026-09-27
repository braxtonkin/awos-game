import { expect, test } from "vitest";
import { buy, canBuy, canCraft, canMine, clickPower, costOf, craft, initialState, mine, productionMultiplier, tick, zoneReached } from "../src/game.ts";
import { recipes } from "../src/recipes.ts";
import { tools } from "../src/tools.ts";
import { zones } from "../src/zones.ts";
import { loadSave } from "../src/save.ts";
import { stateWith } from "./state.ts";

test("catalogs expose the ordered entries", () => {
  expect(tools.map(({ id }) => id)).toEqual(["stonePickaxe", "ironPickaxe"]);
  expect(zones.map(({ id }) => id)).toEqual(["surface", "caves"]);
  expect(recipes.map(({ id }) => id)).toEqual(["torch", "ironIngot"]);
});

test("purchase costs and tool purchases", () => {
  expect(costOf(stateWith({ owned: { woodenAxe: 3 } }), "woodenAxe")).toEqual({ wood: 23 });
  expect(costOf(stateWith({}), "caves")).toEqual({ torch: 400, stone: 1500 });
  const bought = buy(stateWith({ amounts: { stone: 60, wood: 40 } }), "stonePickaxe");
  expect(bought.amounts).toEqual({ stone: 0, wood: 0 });
  expect(bought.owned).toEqual({ stonePickaxe: 1 });
  const alreadyOwned = buy(stateWith({ amounts: { stone: 60, wood: 40 }, owned: { stonePickaxe: 1 } }), "stonePickaxe");
  expect(alreadyOwned.amounts).toEqual({ stone: 60, wood: 40 });
  expect(alreadyOwned.owned).toEqual({ stonePickaxe: 1 });
});

test("zones require tools and are reached once purchased", () => {
  expect(canBuy(stateWith({ amounts: { torch: 400, stone: 1500 } }), "caves")).toBe(false);
  const blocked = buy(stateWith({ amounts: { torch: 400, stone: 1500 } }), "caves");
  expect(blocked.amounts).toEqual({ torch: 400, stone: 1500 });
  expect(blocked.owned).toEqual({});
  const entered = buy(stateWith({ amounts: { torch: 400, stone: 1500 }, owned: { stonePickaxe: 1 } }), "caves");
  expect(entered.amounts).toEqual({ torch: 0, stone: 0 });
  expect(entered.owned).toEqual({ stonePickaxe: 1, caves: 1 });
  expect(zoneReached(initialState, "surface")).toBe(true);
  expect(zoneReached(entered, "caves")).toBe(true);
});

test("mining respects zones and tool click power", () => {
  expect(mine(initialState, "ironIngot")).toBe(initialState);
  expect(mine(initialState, "ironOre").amounts).toEqual({ ironOre: 1 });
  expect(canMine(initialState, "wood")).toBe(true);
  expect(mine(stateWith({ owned: { stonePickaxe: 1 } }), "wood").amounts).toEqual({ wood: 2 });
  expect(mine(stateWith({ owned: { stonePickaxe: 1, ironPickaxe: 1 } }), "wood").amounts).toEqual({ wood: 3 });
  expect(clickPower(stateWith({}))).toBe(1);
  expect(productionMultiplier(initialState, "wood")).toBe(1);
});

test("ticks apply the production multiplier", () => {
  const result = tick(stateWith({ owned: { woodenAxe: 2 } }));
  expect(result.amounts).toEqual({ wood: 2 });
  expect(result.owned).toEqual({ woodenAxe: 2 });
});

test("crafting consumes inputs and produces outputs", () => {
  expect(canCraft(stateWith({ amounts: { coal: 1, wood: 1 } }), "torch")).toBe(true);
  expect(craft(stateWith({ amounts: { coal: 1, wood: 1 } }), "torch").amounts).toEqual({ coal: 0, wood: 0, torch: 4 });
  const insufficient = stateWith({ amounts: { coal: 1 } });
  expect(craft(insufficient, "torch")).toBe(insufficient);
  expect(craft(stateWith({ amounts: { ironOre: 2, coal: 1 } }), "ironIngot").amounts).toEqual({ ironOre: 1, coal: 0, ironIngot: 1 });
});

test("save loading retains tool and zone counts", () => {
  expect(loadSave('{"amounts":{},"owned":{"stonePickaxe":1,"caves":1}}').state.owned).toEqual({ stonePickaxe: 1, caves: 1 });
});
