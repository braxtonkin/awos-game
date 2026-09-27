import { expect, test } from "vitest";
import { tick } from "../src/game.ts";
import { stateWith } from "./state.ts";

test("smelter consumes two iron ore and one charcoal for two ingots", () => {
  expect(tick(stateWith({ amounts: { ironOre: 2, charcoal: 1 }, owned: { smelter: 1 } })).amounts).toEqual({ ironOre: 0, charcoal: 0, ironIngot: 2 });
});

test("smelter waits until it has two iron ore", () => {
  expect(tick(stateWith({ amounts: { ironOre: 1, charcoal: 1 }, owned: { smelter: 1 } })).amounts).toEqual({ ironOre: 1, charcoal: 1 });
});

test("two iron mines produce four iron ore", () => {
  expect(tick(stateWith({ owned: { ironMine: 2 } })).amounts).toEqual({ ironOre: 4 });
});

test("torch workshop consumes one coal and one wood for four torches", () => {
  expect(tick(stateWith({ amounts: { coal: 1, wood: 1 }, owned: { torchWorkshop: 1 } })).amounts).toEqual({ coal: 0, wood: 0, torch: 4 });
});
