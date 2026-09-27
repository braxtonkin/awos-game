import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { catchUp } from "../src/game.ts";
import { resources } from "../src/resources.ts";
import { deserialize } from "../src/save.ts";
import { upgrades } from "../src/upgrades.ts";
import { stateWith } from "./state.ts";

const fixture = (name: string) => JSON.parse(readFileSync(`${process.cwd()}/test/fixtures/catch-up/${name}.json`, "utf8"));
const closeEnough = (actual: unknown, expected: unknown): boolean => {
  if (typeof actual === "number" && typeof expected === "number") {
    const tolerance = Math.max(Math.abs(actual), Math.abs(expected)) < 1 ? 1e-9 : 1e-9 * Math.max(Math.abs(actual), Math.abs(expected));
    return Math.abs(actual - expected) <= tolerance;
  }
  if (Array.isArray(actual) && Array.isArray(expected)) return actual.length === expected.length && actual.every((item, index) => closeEnough(item, expected[index]));
  if (actual !== null && expected !== null && typeof actual === "object" && typeof expected === "object") {
    const left = Object.keys(actual); const right = Object.keys(expected);
    return left.length === right.length && left.every(key => right.includes(key) && closeEnough((actual as Record<string, unknown>)[key], (expected as Record<string, unknown>)[key]));
  }
  return actual === expected;
};

const wave2 = deserialize(readFileSync(`${process.cwd()}/test/fixtures/saves/wave-2.json`, "utf8"));
const wave3 = deserialize(readFileSync(`${process.cwd()}/test/fixtures/catch-up/wave-3-input.json`, "utf8"));
const lateGame = stateWith({ amounts: Object.fromEntries(resources.map(resource => [resource.id, 1000])), owned: Object.fromEntries(upgrades.map(upgrade => [upgrade.id, 10])), event: { id: "rain", secondsLeft: 60 } });

describe("offline catch-up", () => {
  test.each([["wave-2", wave2], ["wave-3", wave3], ["synthetic", lateGame]] as const)("matches the saved %s result", (name, state) => {
    expect(closeEnough(catchUp(state, 28_800_000), fixture(name))).toBe(true);
  });

  test("finishes the late-game eight-hour catch-up under two seconds", () => {
    const started = performance.now();
    catchUp(lateGame, 28_800_000);
    expect(performance.now() - started).toBeLessThan(2_000);
  });
});
