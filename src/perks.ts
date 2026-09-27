import type { PurchaseId } from "./game.ts";

export type PerkEffect =
  | { readonly kind: "startWith"; readonly owned: Partial<Record<PurchaseId, number>> }
  | { readonly kind: "offlineHours"; readonly hours: number }
  | { readonly kind: "eventChance"; readonly factor: number }
  | { readonly kind: "clickPower"; readonly factor: number };

export type Perk = { readonly id: string; readonly name: string; readonly description: string; readonly cost: number; readonly effect: PerkEffect };

export const perks = [
  { id: "stoneStart", name: "Stone start", description: "Start every new world with a Stone pickaxe.", cost: 3, effect: { kind: "startWith", owned: { stonePickaxe: 1 } } },
  { id: "headStart", name: "Head start", description: "Start every new world with 5 Wooden axes and 2 Quarries.", cost: 5, effect: { kind: "startWith", owned: { woodenAxe: 5, quarry: 2 } } },
  { id: "nightShift", name: "Night shift", description: "Offline progress lasts up to 16 hours instead of 8.", cost: 4, effect: { kind: "offlineHours", hours: 16 } },
  { id: "lucky", name: "Lucky", description: "Events start twice as often.", cost: 4, effect: { kind: "eventChance", factor: 2 } },
  { id: "strongArm", name: "Strong arm", description: "Every click mines 50% more.", cost: 6, effect: { kind: "clickPower", factor: 1.5 } },
] as const satisfies readonly Perk[];

export type PerkId = (typeof perks)[number]["id"];
