import { expect, test } from "vitest";
import { buy, initialState, startNewWorld } from "../src/game.ts";
import { loadSave, serialize } from "../src/save.ts";
import { openPage } from "./page.ts";
import { stateWith } from "./state.ts";

const readyForCaves = (records: Partial<Record<"caves", number>> = {}) => stateWith({
  amounts: { torch: 400, stone: 1500 },
  owned: { stonePickaxe: 1 },
  stats: { clicks: 0, ticks: 234, gathered: {} },
  lifetime: { ...initialState.lifetime, records },
});

test("zone purchase records a new fastest time and keeps a faster record", () => {
  expect(buy(readyForCaves(), "caves").lifetime.records).toEqual({ caves: 234 });
  expect(buy(readyForCaves({ caves: 200 }), "caves").lifetime.records).toEqual({ caves: 200 });
  expect(buy(readyForCaves({ caves: 300 }), "caves").lifetime.records).toEqual({ caves: 234 });
});

test("new worlds keep fastest zone records", () => {
  const state = stateWith({ ...readyForCaves({ caves: 234 }), stats: { clicks: 0, ticks: 234, gathered: { wood: 100_000 } } });
  expect(startNewWorld(state).lifetime.records).toEqual({ caves: 234 });
});

test("save decoder keeps only known finite nonnegative zone records", () => {
  const loaded = loadSave(JSON.stringify({ version: 2, state: { lifetime: { records: { caves: 234, deepCaves: -1, nether: Infinity, unknown: 10, end: "3" } } } }));
  expect(loaded.state.lifetime.records).toEqual({ caves: 234 });
});

test("stats page shows the recorded fastest time", () => {
  openPage(serialize(stateWith({ lifetime: { ...initialState.lifetime, records: { caves: 234 } } }), 1_000_000));
  const stats = document.querySelector('[data-section="stats"]')?.textContent ?? "";
  expect(stats).toContain("Fastest to Caves: 3m 54s");
});
