import { expect, test } from "vitest";
import { buy, craft, initialState, mine, tick } from "../src/game.ts";
import { loadSave } from "../src/save.ts";
import { serialize } from "../src/save.ts";
import { openPage } from "./page.ts";
import { stateWith } from "./state.ts";
import v1 from "./fixtures/saves/v1.json";
import v2 from "./fixtures/saves/v2.json";

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

test("old v2 fixture loads with zero lifetime totals", () => {
  expect(loadSave(JSON.stringify(v2)).state.lifetime).toEqual({ clicks: 0, ticks: 0, gathered: 0 });
});

test("stats page displays combined all-world totals", () => {
  openPage(serialize(stateWith({ stats: { clicks: 2, ticks: 60, gathered: { wood: 100 } }, lifetime: { clicks: 3, ticks: 3600, gathered: 500 }, prestige: { ...initialState.prestige, emeralds: 0, worlds: 2 } }), 1_000_000));
  const stats = document.querySelector('[data-section="stats"]')?.textContent ?? "";
  expect(stats).toContain("Worlds started: 2");
  expect(stats).toContain("Time in all worlds: 1h 01m");
});

test("stats decoder filters invalid counts and unknown resources", () => {
  const loaded = loadSave('{"version":2,"state":{"stats":{"clicks":-1,"ticks":3,"gathered":{"wood":2,"unknown":8,"dirt":"4"}}}}');
  expect(loaded.state.stats).toEqual({ clicks: 0, ticks: 3, gathered: { wood: 2 } });
});
