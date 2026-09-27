import type { Amounts } from "./resources.ts";

export type Tool = { readonly id: string; readonly name: string; readonly cost: Amounts; readonly clickPower: number };

export const tools = [
  { id: "stonePickaxe", name: "Stone pickaxe", cost: { stone: 60, wood: 40 }, clickPower: 2 },
  { id: "ironPickaxe", name: "Iron pickaxe", cost: { ironIngot: 300, wood: 1000 }, clickPower: 3 },
] as const satisfies readonly Tool[];

export type ToolId = (typeof tools)[number]["id"];
