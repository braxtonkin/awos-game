import { expect, test } from "vitest";
import { tick, togglePause } from "../src/game.ts";
import { stateWith } from "./state.ts";

test("a paused Furnace neither consumes wood nor produces charcoal", () => {
  expect(tick(stateWith({ amounts: { wood: 5 }, owned: { furnace: 1 }, paused: ["furnace"] })).amounts).toEqual({ wood: 5 });
});

test("resuming a Furnace consumes wood and produces charcoal", () => {
  expect(tick(togglePause(stateWith({ amounts: { wood: 5 }, owned: { furnace: 1 }, paused: ["furnace"] }), "furnace")).amounts).toEqual({ wood: 3, charcoal: 1 });
});

test("toggling pause twice removes the upgrade id", () => {
  expect(togglePause(togglePause(stateWith({}), "furnace"), "furnace").paused).toEqual([]);
});
