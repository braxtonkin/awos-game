import type { ResourceId } from "./resources.ts";
import type { PurchaseId } from "./game.ts";

export type Condition =
  | { readonly kind: "gathered"; readonly resource: ResourceId; readonly atLeast: number }
  | { readonly kind: "gatheredTotal"; readonly atLeast: number }
  | { readonly kind: "owned"; readonly id: PurchaseId; readonly atLeast: number }
  | { readonly kind: "machines"; readonly atLeast: number }
  | { readonly kind: "clicks"; readonly atLeast: number }
  | { readonly kind: "worlds"; readonly atLeast: number }
  | { readonly kind: "emeralds"; readonly atLeast: number };

export const achievements = [
  { id: "firstLog", name: "First log", description: "Gather 1 Wood", when: { kind: "gathered", resource: "wood", atLeast: 1 } },
  { id: "lumberjack", name: "Lumberjack", description: "Own 10 Wooden axes", when: { kind: "owned", id: "woodenAxe", atLeast: 10 } },
  { id: "stoneTools", name: "Stone tools", description: "Own a Stone pickaxe", when: { kind: "owned", id: "stonePickaxe", atLeast: 1 } },
  { id: "intoTheDark", name: "Into the dark", description: "Reach the Caves", when: { kind: "owned", id: "caves", atLeast: 1 } },
  { id: "ironWorks", name: "Iron works", description: "Gather 100 Iron ingots", when: { kind: "gathered", resource: "ironIngot", atLeast: 100 } },
  { id: "ironTools", name: "Iron tools", description: "Own an Iron pickaxe", when: { kind: "owned", id: "ironPickaxe", atLeast: 1 } },
  { id: "torchbearer", name: "Torchbearer", description: "Gather 1,000 Torches", when: { kind: "gathered", resource: "torch", atLeast: 1000 } },
  { id: "busyHands", name: "Busy hands", description: "Click 1,000 times", when: { kind: "clicks", atLeast: 1000 } },
  { id: "factory", name: "Factory", description: "Own 50 machines", when: { kind: "machines", atLeast: 50 } },
  { id: "stockpile", name: "Stockpile", description: "Gather 100,000 resources in one world", when: { kind: "gatheredTotal", atLeast: 100000 } },
  { id: "deeper", name: "Deeper", description: "Reach the Deep caves", when: { kind: "owned", id: "deepCaves", atLeast: 1 } },
  { id: "shiny", name: "Shiny", description: "Gather 1 Diamond", when: { kind: "gathered", resource: "diamond", atLeast: 1 } },
  { id: "diamondTools", name: "Diamond tools", description: "Own a Diamond pickaxe", when: { kind: "owned", id: "diamondPickaxe", atLeast: 1 } },
  { id: "goldRush", name: "Gold rush", description: "Gather 1,000 Gold ingots", when: { kind: "gathered", resource: "goldIngot", atLeast: 1000 } },
  { id: "clickStorm", name: "Click storm", description: "Click 10,000 times", when: { kind: "clicks", atLeast: 10000 } },
  { id: "machinist", name: "Machinist", description: "Own 100 machines", when: { kind: "machines", atLeast: 100 } },
  { id: "smeltery", name: "Smeltery", description: "Own 10 Smelters", when: { kind: "owned", id: "smelter", atLeast: 10 } },
  { id: "torchlight", name: "Torchlight", description: "Gather 10,000 Torches", when: { kind: "gathered", resource: "torch", atLeast: 10000 } },
  { id: "obsidianWall", name: "Obsidian wall", description: "Gather 1,000 Obsidian", when: { kind: "gathered", resource: "obsidian", atLeast: 1000 } },
  { id: "millionaire", name: "Millionaire", description: "Gather 1,000,000 resources in one world", when: { kind: "gatheredTotal", atLeast: 1000000 } },
  { id: "tooHot", name: "Too hot", description: "Reach the Nether", when: { kind: "owned", id: "nether", atLeast: 1 } },
  { id: "netheriteTools", name: "Netherite tools", description: "Own a Netherite pickaxe", when: { kind: "owned", id: "netheritePickaxe", atLeast: 1 } },
  { id: "blazing", name: "Blazing", description: "Gather 1,000 Blaze rods", when: { kind: "gathered", resource: "blazeRod", atLeast: 1000 } },
  { id: "pearlDiver", name: "Pearl diver", description: "Gather 1,000 Ender pearls", when: { kind: "gathered", resource: "enderPearl", atLeast: 1000 } },
  { id: "ancientHistory", name: "Ancient history", description: "Gather 100 Ancient debris", when: { kind: "gathered", resource: "ancientDebris", atLeast: 100 } },
  { id: "freshStart", name: "Fresh start", description: "Start a new world", when: { kind: "worlds", atLeast: 1 } },
  { id: "worldHopper", name: "World hopper", description: "Start 5 new worlds", when: { kind: "worlds", atLeast: 5 } },
  { id: "emeraldHoard", name: "Emerald hoard", description: "Hold 25 Emeralds", when: { kind: "emeralds", atLeast: 25 } },
  { id: "lavaLord", name: "Lava lord", description: "Own 10 Lava pumps", when: { kind: "owned", id: "lavaPump", atLeast: 10 } },
  { id: "tenMillion", name: "Ten million", description: "Gather 10,000,000 resources in one world", when: { kind: "gatheredTotal", atLeast: 10000000 } },
] as const satisfies readonly { id: string; name: string; description: string; when: Condition }[];

export type AchievementId = typeof achievements[number]["id"];
