import type { ResourceId } from "./resources.ts";
import type { PurchaseId } from "./game.ts";

export type Condition =
  | { readonly kind: "gathered"; readonly resource: ResourceId; readonly atLeast: number }
  | { readonly kind: "gatheredTotal"; readonly atLeast: number }
  | { readonly kind: "owned"; readonly id: PurchaseId; readonly atLeast: number }
  | { readonly kind: "machines"; readonly atLeast: number }
  | { readonly kind: "clicks"; readonly atLeast: number };

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
] as const satisfies readonly { id: string; name: string; description: string; when: Condition }[];

export type AchievementId = typeof achievements[number]["id"];
