import { expect, test } from "vitest";
import { achievements } from "../src/achievements.ts";
import { earnAchievements, initialState, mine, tick } from "../src/game.ts";
import { loadSave } from "../src/save.ts";
import { stateWith } from "./state.ts";

test("achievement catalog has the required order", () => {
  expect(achievements.map(({ id }) => id)).toEqual(["firstLog", "lumberjack", "stoneTools", "intoTheDark", "ironWorks", "ironTools", "torchbearer", "busyHands", "factory", "stockpile", "deeper", "shiny", "diamondTools", "goldRush", "clickStorm", "machinist", "smeltery", "torchlight", "obsidianWall", "millionaire", "tooHot", "netheriteTools", "blazing", "pearlDiver", "ancientHistory", "freshStart", "worldHopper", "emeraldHoard", "lavaLord", "tenMillion", "beyondThePortal", "twelveEyes", "endStoneMason", "perkCollector", "fullFactory", "farmer", "hundredMillion", "dragonSlayer"]);
});

test("reaching the End earns beyondThePortal", () => {
  expect(earnAchievements(stateWith({ owned: { end: 1 } })).achievements).toEqual(["beyondThePortal"]);
});

test("gathering 12 Eyes of ender earns twelveEyes", () => {
  expect(earnAchievements(stateWith({ stats: { clicks: 0, ticks: 0, gathered: { eyeOfEnder: 12 } } })).achievements).toEqual(["twelveEyes"]);
});

test("gathering 10,000 End stone earns endStoneMason", () => {
  expect(earnAchievements(stateWith({ stats: { clicks: 0, ticks: 0, gathered: { endStone: 10000 } } })).achievements).toEqual(["endStoneMason"]);
});

test("owning three perks earns perkCollector", () => {
  expect(earnAchievements(stateWith({ prestige: { ...initialState.prestige, perks: ["stoneStart", "lucky", "nightShift"] } })).achievements).toEqual(["perkCollector"]);
});

test("owning 250 machines earns fullFactory", () => {
  expect(earnAchievements(stateWith({ owned: { woodenAxe: 250 } })).achievements).toContain("fullFactory");
});

test("owning 10 Enderman farms earns farmer", () => {
  expect(earnAchievements(stateWith({ owned: { endermanFarm: 10 } })).achievements).toEqual(["farmer"]);
});

test("gathering 100,000,000 resources earns hundredMillion", () => {
  expect(earnAchievements(stateWith({ stats: { clicks: 0, ticks: 0, gathered: { wood: 100000000 } } })).achievements).toContain("hundredMillion");
  expect(achievements.map(({ id }) => id)).toEqual(["firstLog", "lumberjack", "stoneTools", "intoTheDark", "ironWorks", "ironTools", "torchbearer", "busyHands", "factory", "stockpile", "deeper", "shiny", "diamondTools", "goldRush", "clickStorm", "machinist", "smeltery", "torchlight", "obsidianWall", "millionaire", "tooHot", "netheriteTools", "blazing", "pearlDiver", "ancientHistory", "freshStart", "worldHopper", "emeraldHoard", "lavaLord", "tenMillion", "beyondThePortal", "twelveEyes", "endStoneMason", "perkCollector", "fullFactory", "farmer", "hundredMillion", "dragonSlayer"]);
});

test("mining wood earns firstLog only once", () => {
  const first = mine(stateWith({}), "wood");
  expect(first.achievements).toEqual(["firstLog"]);
  expect(mine(first, "wood").achievements).toEqual(["firstLog"]);
});

test("owning a Stone pickaxe earns stoneTools", () => {
  expect(earnAchievements(stateWith({ owned: { stonePickaxe: 1 } })).achievements).toEqual(["stoneTools"]);
});

test("reaching the Deep caves earns deeper", () => {
  expect(earnAchievements(stateWith({ owned: { deepCaves: 1 } })).achievements).toEqual(["deeper"]);
});

test("gathering a Diamond earns shiny", () => {
  expect(earnAchievements(stateWith({ stats: { clicks: 0, ticks: 0, gathered: { diamond: 1 } } })).achievements).toEqual(["shiny"]);
});

test("owning 10 Smelters earns smeltery", () => {
  expect(earnAchievements(stateWith({ owned: { smelter: 10 } })).achievements).toEqual(["smeltery"]);
});

test("prestige thresholds earn freshStart and emeraldHoard", () => {
  expect(earnAchievements(stateWith({ prestige: { ...initialState.prestige, emeralds: 25, worlds: 1 } })).achievements).toEqual(["freshStart", "emeraldHoard"]);
});

test("owning the Nether earns tooHot", () => {
  expect(earnAchievements(stateWith({ owned: { nether: 1 } })).achievements).toEqual(["tooHot"]);
});

test("three achievements add three percent to machine production", () => {
  expect(tick(stateWith({ owned: { woodenAxe: 1 }, achievements: ["firstLog", "stoneTools", "intoTheDark"] })).amounts.wood).toBe(1.03);
});

test("save decoder filters unknown and duplicate achievement ids", () => {
  expect(loadSave('{"version":2,"savedAt":1,"state":{"amounts":{},"owned":{},"achievements":["firstLog","noSuchAchievement","firstLog"]}}').state.achievements).toEqual(["firstLog"]);
});
