import { expect, test } from "vitest";
import { buy, craft, mine } from "../src/game.ts";
import { stateWith } from "./state.ts";

test("buying Deep caves spends its cost when the Iron pickaxe is owned", () => {
  const result = buy(stateWith({ amounts: { torch: 2000, ironIngot: 1000, stone: 8000 }, owned: { ironPickaxe: 1 } }), "deepCaves");
  expect(result.owned).toEqual({ ironPickaxe: 1, deepCaves: 1 });
  expect(result.amounts).toEqual({ torch: 0, ironIngot: 0, stone: 0 });
});

test("buying Deep caves requires the Iron pickaxe", () => {
  const state = stateWith({ amounts: { torch: 2000, ironIngot: 1000, stone: 8000 } });
  expect(buy(state, "deepCaves")).toEqual(state);
});

test("the Diamond pickaxe mines five Diamonds in Deep caves", () => {
  expect(mine(stateWith({ owned: { caves: 1, deepCaves: 1, diamondPickaxe: 1 } }), "diamond").amounts).toEqual({ diamond: 5 });
});

test("Diamond cannot be mined from Caves alone", () => {
  expect(mine(stateWith({ owned: { caves: 1 } }), "diamond").amounts).toEqual({});
});

test("crafting a Gold ingot uses Gold ore and Coal", () => {
  expect(craft(stateWith({ amounts: { goldOre: 1, coal: 1 } }), "goldIngot").amounts).toEqual({ goldOre: 0, coal: 0, goldIngot: 1 });
});
