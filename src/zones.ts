import type { Amounts, ResourceId } from "./resources.ts";
import type { ToolId } from "./tools.ts";

export type Zone = { readonly id: string; readonly name: string; readonly cost: Amounts; readonly requires: ToolId | null; readonly resources: readonly ResourceId[] };

export const zones = [
  { id: "surface", name: "Surface", cost: {}, requires: null, resources: ["dirt", "wood", "coal", "stone"] },
  { id: "caves", name: "Caves", cost: { torch: 400, stone: 1500 }, requires: "stonePickaxe", resources: ["ironOre"] },
  { id: "deepCaves", name: "Deep caves", cost: { torch: 2000, ironIngot: 1000, stone: 8000 }, requires: "ironPickaxe", resources: ["goldOre", "redstone", "diamond", "obsidian"] },
  { id: "nether", name: "The Nether", cost: { obsidian: 1500, ironIngot: 6000, goldIngot: 1000 }, requires: "diamondPickaxe", resources: ["netherrack", "netherQuartz", "ancientDebris", "blazeRod", "enderPearl"] },
  { id: "end", name: "The End", cost: { eyeOfEnder: 12 }, requires: "netheritePickaxe", resources: ["endStone"] },
] as const satisfies readonly Zone[];

export type ZoneId = (typeof zones)[number]["id"];
