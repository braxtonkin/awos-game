import { expect, test } from "vitest";
import { tick } from "../src/game.ts";
import { stateWith } from "./state.ts";

test("one Gold smelter consumes gold ore and coal to produce gold ingots", () => {
  expect(tick(stateWith({ amounts: { goldOre: 2, coal: 1 }, owned: { goldSmelter: 1 } })).amounts).toEqual({ goldOre: 0, coal: 0, goldIngot: 2 });
});

test("Gold mines, Lava pumps, and Diamond drills produce resources each tick", () => {
  expect(tick(stateWith({ owned: { goldMine: 1, lavaPump: 3, diamondDrill: 2 } })).amounts).toEqual({ goldOre: 2, obsidian: 3, diamond: 2 });
});
