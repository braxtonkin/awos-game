import { expect, test } from "vitest";
import { achievements } from "../src/achievements.ts";
import { earnAchievements, mine, tick } from "../src/game.ts";
import { loadSave } from "../src/save.ts";
import { stateWith } from "./state.ts";

test("achievement catalog has the required order", () => {
  expect(achievements.map(({ id }) => id)).toEqual(["firstLog", "lumberjack", "stoneTools", "intoTheDark", "ironWorks", "ironTools", "torchbearer", "busyHands", "factory", "stockpile"]);
});

test("mining wood earns firstLog only once", () => {
  const first = mine(stateWith({}), "wood");
  expect(first.achievements).toEqual(["firstLog"]);
  expect(mine(first, "wood").achievements).toEqual(["firstLog"]);
});

test("owning a Stone pickaxe earns stoneTools", () => {
  expect(earnAchievements(stateWith({ owned: { stonePickaxe: 1 } })).achievements).toEqual(["stoneTools"]);
});

test("three achievements add three percent to machine production", () => {
  expect(tick(stateWith({ owned: { woodenAxe: 1 }, achievements: ["firstLog", "stoneTools", "intoTheDark"] })).amounts.wood).toBe(1.03);
});

test("save decoder filters unknown and duplicate achievement ids", () => {
  expect(loadSave('{"version":2,"savedAt":1,"state":{"amounts":{},"owned":{},"achievements":["firstLog","noSuchAchievement","firstLog"]}}').state.achievements).toEqual(["firstLog"]);
});
