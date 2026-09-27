import type { Amounts, ResourceId } from "./resources.ts";
import type { ToolId } from "./tools.ts";

export type Zone = { readonly id: string; readonly name: string; readonly cost: Amounts; readonly requires: ToolId | null; readonly resources: readonly ResourceId[] };

export const zones = [
  { id: "surface", name: "Surface", cost: {}, requires: null, resources: ["dirt", "wood", "coal", "stone"] },
  { id: "caves", name: "Caves", cost: { torch: 400, stone: 1500 }, requires: "stonePickaxe", resources: ["ironOre"] },
] as const satisfies readonly Zone[];

export type ZoneId = (typeof zones)[number]["id"];
