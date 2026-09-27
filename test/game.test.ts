import { expect, test } from "vitest";
import { buy, canBuy, catchUp, costOf, mine, tick } from "../src/game.ts";
import { stateWith } from "./state.ts";

test("mining dirt in a new game gives 1 dirt", () => {
  expect(mine(stateWith({}), "dirt").amounts).toEqual({ dirt: 1 });
});

test("mining wood adds 1 wood and leaves the dirt as it was", () => {
  expect(mine(stateWith({ amounts: { dirt: 4, wood: 2 } }), "wood").amounts).toEqual({ dirt: 4, wood: 3 });
});

test("mining iron ore in a new game gives 1 iron ore", () => {
  expect(mine(stateWith({}), "ironOre").amounts).toEqual({ ironOre: 1 });
});

test("mining coal in a new game gives 1 coal", () => {
  expect(mine(stateWith({}), "coal").amounts).toEqual({ coal: 1 });
});

test("mining stone in a new game gives 1 stone", () => {
  expect(mine(stateWith({}), "stone").amounts).toEqual({ stone: 1 });
});

test("a wooden pickaxe can be bought with exactly 10 wood", () => {
  expect(canBuy(stateWith({ amounts: { wood: 10 } }), "woodenPickaxe")).toBe(true);
});

test("a wooden pickaxe cannot be bought with 9 wood, however much dirt there is", () => {
  expect(canBuy(stateWith({ amounts: { dirt: 50, wood: 9 } }), "woodenPickaxe")).toBe(false);
});

test("buying another wooden pickaxe spends 12 wood and adds one to the owned count", () => {
  const result = buy(stateWith({ amounts: { dirt: 3, wood: 12 }, owned: { woodenPickaxe: 1 } }), "woodenPickaxe");
  expect(result.amounts).toEqual({ dirt: 3, wood: 0 });
  expect(result.owned).toEqual({ woodenPickaxe: 2 });
});

test("upgrade costs rise with the owned count", () => {
  expect(costOf(stateWith({ owned: { woodenAxe: 0 } }), "woodenAxe")).toEqual({ wood: 15 });
  expect(costOf(stateWith({ owned: { woodenAxe: 1 } }), "woodenAxe")).toEqual({ wood: 18 });
  expect(costOf(stateWith({ owned: { woodenAxe: 2 } }), "woodenAxe")).toEqual({ wood: 20 });
  expect(costOf(stateWith({ owned: { woodenAxe: 3 } }), "woodenAxe")).toEqual({ wood: 23 });
  expect(costOf(stateWith({ owned: { woodenAxe: 10 } }), "woodenAxe")).toEqual({ wood: 61 });
  expect(costOf(stateWith({ owned: { furnace: 3 } }), "furnace")).toEqual({ dirt: 31, wood: 16 });
  expect(costOf(stateWith({}), "stonePickaxe")).toEqual({ stone: 60, wood: 40 });
});

test("buying a second wooden axe charges its increased price", () => {
  const result = buy(stateWith({ amounts: { wood: 30 }, owned: { woodenAxe: 1 } }), "woodenAxe");
  expect(result.amounts).toEqual({ wood: 12 });
  expect(result.owned).toEqual({ woodenAxe: 2 });
});

test("buying a wooden pickaxe without enough wood changes nothing", () => {
  const result = buy(stateWith({ amounts: { wood: 9 } }), "woodenPickaxe");
  expect(result.amounts).toEqual({ wood: 9 });
  expect(result.owned).toEqual({});
});

test("buying a wooden axe with exactly 15 wood spends it and adds one axe", () => {
  const result = buy(stateWith({ amounts: { wood: 15 } }), "woodenAxe");
  expect(result.amounts).toEqual({ wood: 0 });
  expect(result.owned).toEqual({ woodenAxe: 1 });
});

test("a tick with two wooden axes adds 2 wood", () => {
  const result = tick(stateWith({ owned: { woodenAxe: 2 } }));
  expect(result.amounts).toEqual({ wood: 2 });
  expect(result.owned).toEqual({ woodenAxe: 2 });
});

test("a tick with no upgrades owned changes nothing", () => {
  expect(tick(stateWith({ amounts: { wood: 5 } })).amounts).toEqual({ wood: 5 });
});

test("a tick adds 1 dirt for each wooden pickaxe owned", () => {
  const result = tick(stateWith({ amounts: { dirt: 2 }, owned: { woodenPickaxe: 3 } }));
  expect(result.amounts).toEqual({ dirt: 5 });
  expect(result.owned).toEqual({ woodenPickaxe: 3 });
});

test("one furnace with 5 wood makes 1 charcoal and uses 2 wood", () => {
  const result = tick(stateWith({ amounts: { wood: 5 }, owned: { furnace: 1 } }));
  expect(result.amounts).toEqual({ wood: 3, charcoal: 1 });
  expect(result.owned).toEqual({ furnace: 1 });
});

test("two furnaces with 3 wood only let one furnace run", () => {
  const result = tick(stateWith({ amounts: { wood: 3 }, owned: { furnace: 2 } }));
  expect(result.amounts).toEqual({ wood: 1, charcoal: 1 });
  expect(result.owned).toEqual({ furnace: 2 });
});

test("one furnace with 1 wood changes nothing", () => {
  const result = tick(stateWith({ amounts: { wood: 1 }, owned: { furnace: 1 } }));
  expect(result.amounts).toEqual({ wood: 1 });
  expect(result.owned).toEqual({ furnace: 1 });
});

test("catch-up applies 10 whole seconds of ticks", () => {
  expect(catchUp(stateWith({ owned: { woodenPickaxe: 1 } }), 10_000).amounts).toEqual({ dirt: 10 });
});

test("catch-up floors elapsed milliseconds to whole seconds", () => {
  expect(catchUp(stateWith({ owned: { woodenPickaxe: 1 } }), 9_500).amounts).toEqual({ dirt: 9 });
});

test("catch-up caps elapsed time at eight hours", () => {
  expect(catchUp(stateWith({ owned: { woodenPickaxe: 1 } }), 2 * 24 * 60 * 60 * 1000).amounts).toEqual({ dirt: 28_800 });
});
