import { expect, test } from "vitest";
import { buy, craft, mine } from "../src/game.ts";
import { stateWith } from "./state.ts";

test("The End requires a Netherite pickaxe and twelve Eyes of ender", () => {
  const start = stateWith({ amounts: { eyeOfEnder: 12 } });
  expect(buy(start, "end")).toEqual(start);
  const entered = buy(stateWith({ amounts: { eyeOfEnder: 12 }, owned: { netheritePickaxe: 1 } }), "end");
  expect(entered.owned).toEqual({ netheritePickaxe: 1, end: 1 });
  expect(entered.amounts).toEqual({ eyeOfEnder: 0 });
});

test("Netherite pickaxe mines eight End stone per click", () => {
  expect(mine(stateWith({ owned: { end: 1, netheritePickaxe: 1 } }), "endStone").amounts).toEqual({ endStone: 8 });
});

test("Eye of ender recipe consumes Ender pearls and Blaze powder", () => {
  expect(craft(stateWith({ amounts: { enderPearl: 300, blazePowder: 300 } }), "eyeOfEnder").amounts).toEqual({ enderPearl: 0, blazePowder: 0, eyeOfEnder: 1 });
});
