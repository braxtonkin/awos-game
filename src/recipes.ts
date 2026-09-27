import type { Amounts } from "./resources.ts";

export type Recipe = { readonly id: string; readonly name: string; readonly inputs: Amounts; readonly outputs: Amounts };

export const recipes = [
  { id: "torch", name: "Torch", inputs: { coal: 1, wood: 1 }, outputs: { torch: 4 } },
  { id: "ironIngot", name: "Iron ingot", inputs: { ironOre: 1, coal: 1 }, outputs: { ironIngot: 1 } },
] as const satisfies readonly Recipe[];

export type RecipeId = (typeof recipes)[number]["id"];
