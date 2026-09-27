import type { Amounts } from "./resources.ts";

export type Recipe = { readonly id: string; readonly name: string; readonly inputs: Amounts; readonly outputs: Amounts };

export const recipes = [
  { id: "torch", name: "Torch", inputs: { coal: 1, wood: 1 }, outputs: { torch: 4 } },
  { id: "ironIngot", name: "Iron ingot", inputs: { ironOre: 1, coal: 1 }, outputs: { ironIngot: 1 } },
  { id: "goldIngot", name: "Gold ingot", inputs: { goldOre: 1, coal: 1 }, outputs: { goldIngot: 1 } },
  { id: "netheriteIngot", name: "Netherite ingot", inputs: { ancientDebris: 4, goldIngot: 4 }, outputs: { netheriteIngot: 1 } },
  { id: "blazePowder", name: "Blaze powder", inputs: { blazeRod: 1 }, outputs: { blazePowder: 2 } },
  { id: "eyeOfEnder", name: "Eye of ender", inputs: { enderPearl: 300, blazePowder: 300 }, outputs: { eyeOfEnder: 1 } },
] as const satisfies readonly Recipe[];

export type RecipeId = (typeof recipes)[number]["id"];
