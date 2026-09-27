import { expect, test } from "vitest";
import { simulate } from "../sim/simulate.ts";
import { stateWith } from "./state.ts";

test("crafts torch inputs to buy caves", () => {
  const report = simulate({ ticks: 60, clicksPerTick: 2, start: stateWith({ amounts: { coal: 100, wood: 100, stone: 1500 }, owned: { stonePickaxe: 1 } }), script: [{ order: 10, own: "caves", count: 1 }] });
  expect(report.reached).toContainEqual({ label: "caves:1", tick: 50 });
});

test("buys a stone pickaxe at tick 50", () => {
  const report = simulate({ ticks: 60, clicksPerTick: 2, script: [{ order: 10, own: "stonePickaxe", count: 1 }] });
  expect(report.reached).toContainEqual({ label: "stonePickaxe:1", tick: 50 });
});
