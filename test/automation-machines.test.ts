import { expect, test } from "vitest";
import { tick } from "../src/game.ts";
import { stateWith } from "./state.ts";

test("the Smelter consumes two iron ore and one charcoal for two ingots", () => {
  expect(tick(stateWith({ amounts: { ironOre: 2, charcoal: 1 }, owned: { smelter: 1 } })).amounts).toEqual({ ironOre: 0, charcoal: 0, ironIngot: 2 });
});

test("the Smelter waits when it has less than two iron ore", () => {
  expect(tick(stateWith({ amounts: { ironOre: 1, charcoal: 1 }, owned: { smelter: 1 } })).amounts).toEqual({ ironOre: 1, charcoal: 1 });
});

test("two Iron mines produce four iron ore", () => {
  expect(tick(stateWith({ owned: { ironMine: 2 } })).amounts).toEqual({ ironOre: 4 });
});

test("the Torch workshop consumes coal and wood for four torches", () => {
  expect(tick(stateWith({ amounts: { coal: 1, wood: 1 }, owned: { torchWorkshop: 1 } })).amounts).toEqual({ coal: 0, wood: 0, torch: 4 });
});
