import { expect, test } from "vitest";
import { buy, craft, mine, tick } from "../src/game.ts";
import { loadSave } from "../src/save.ts";
import { stateWith } from "./state.ts";
import v1 from "./fixtures/saves/v1.json";

test("mining records a click and gathered resource", () => {
  expect(mine(stateWith({}), "wood").stats).toEqual({ clicks: 1, ticks: 0, gathered: { wood: 1 } });
});

test("ticks record produced resources and tick count", () => {
  expect(tick(stateWith({ owned: { woodenAxe: 2 } })).stats).toEqual({ clicks: 0, ticks: 1, gathered: { wood: 2 } });
});

test("tick gathering excludes consumed resources", () => {
  expect(tick(stateWith({ amounts: { wood: 5 }, owned: { furnace: 1 } })).stats.gathered).toEqual({ charcoal: 1 });
});

test("craft records outputs and a click", () => {
  expect(craft(stateWith({ amounts: { coal: 1, wood: 1 } }), "torch").stats).toEqual({ clicks: 1, ticks: 0, gathered: { torch: 4 } });
});

test("buying changes no stats", () => {
  expect(buy(stateWith({ amounts: { wood: 15 } }), "woodenAxe").stats).toEqual({ clicks: 0, ticks: 0, gathered: {} });
});

test("old v1 fixture loads with zero stats", () => {
  expect(loadSave(JSON.stringify(v1)).state.stats).toEqual({ clicks: 0, ticks: 0, gathered: {} });
});

test("stats decoder filters invalid counts and unknown resources", () => {
  const loaded = loadSave('{"version":2,"state":{"stats":{"clicks":-1,"ticks":3,"gathered":{"wood":2,"unknown":8,"dirt":"4"}}}}');
  expect(loaded.state.stats).toEqual({ clicks: 0, ticks: 3, gathered: { wood: 2 } });
});
