import { expect, test } from "vitest";
import { buy, craft, mine } from "../src/game.ts";
import { stateWith } from "./state.ts";

test("Nether requires a Diamond pickaxe", () => {
  const start = stateWith({ amounts: { obsidian: 1500, ironIngot: 6000, goldIngot: 1000 } });
  const blocked = buy(start, "nether");
  expect(blocked.amounts).toEqual({ obsidian: 1500, ironIngot: 6000, goldIngot: 1000 });
  expect(blocked.owned).toEqual({});
  const entered = buy(stateWith({ amounts: { obsidian: 1500, ironIngot: 6000, goldIngot: 1000 }, owned: { diamondPickaxe: 1 } }), "nether");
  expect(entered.owned).toEqual({ diamondPickaxe: 1, nether: 1 });
});

test("Netherite pickaxe mines eight Netherrack per click", () => {
  expect(mine(stateWith({ owned: { nether: 1, netheritePickaxe: 1 } }), "netherrack").amounts).toEqual({ netherrack: 8 });
});

test("Netherite ingot recipe consumes debris and gold", () => {
  expect(craft(stateWith({ amounts: { ancientDebris: 4, goldIngot: 4 } }), "netheriteIngot").amounts).toEqual({ ancientDebris: 0, goldIngot: 0, netheriteIngot: 1 });
});

test("Blaze powder recipe doubles a Blaze rod", () => {
  expect(craft(stateWith({ amounts: { blazeRod: 1 } }), "blazePowder").amounts).toEqual({ blazeRod: 0, blazePowder: 2 });
});
