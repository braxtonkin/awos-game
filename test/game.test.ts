import { expect, test } from "vitest";
import { buy, canBuy, initialState, mine, tick } from "../src/game.ts";

test("mining dirt in a new game gives 1 dirt", () => {
  expect(mine(initialState, "dirt")).toEqual({ amounts: { dirt: 1 }, owned: {} });
});

test("mining wood adds 1 wood and leaves the dirt as it was", () => {
  expect(mine({ amounts: { dirt: 4, wood: 2 }, owned: {} }, "wood")).toEqual({
    amounts: { dirt: 4, wood: 3 },
    owned: {},
  });
});

test("mining coal in a new game gives 1 coal", () => {
  expect(mine(initialState, "coal")).toEqual({ amounts: { coal: 1 }, owned: {} });
});

test("a wooden pickaxe can be bought with exactly 10 wood", () => {
  expect(canBuy({ amounts: { wood: 10 }, owned: {} }, "woodenPickaxe")).toBe(true);
});

test("a wooden pickaxe cannot be bought with 9 wood, however much dirt there is", () => {
  expect(canBuy({ amounts: { dirt: 50, wood: 9 }, owned: {} }, "woodenPickaxe")).toBe(false);
});

test("buying another wooden pickaxe spends 10 wood and adds one to the owned count", () => {
  expect(
    buy({ amounts: { dirt: 3, wood: 12 }, owned: { woodenPickaxe: 1 } }, "woodenPickaxe"),
  ).toEqual({ amounts: { dirt: 3, wood: 2 }, owned: { woodenPickaxe: 2 } });
});

test("buying a wooden pickaxe without enough wood changes nothing", () => {
  expect(buy({ amounts: { wood: 9 }, owned: {} }, "woodenPickaxe")).toEqual({
    amounts: { wood: 9 },
    owned: {},
  });
});

test("a tick with no upgrades owned changes nothing", () => {
  expect(tick({ amounts: { wood: 5 }, owned: {} })).toEqual({ amounts: { wood: 5 }, owned: {} });
});

test("a tick adds 1 dirt for each wooden pickaxe owned", () => {
  expect(tick({ amounts: { dirt: 2 }, owned: { woodenPickaxe: 3 } })).toEqual({
    amounts: { dirt: 5 },
    owned: { woodenPickaxe: 3 },
  });
});
