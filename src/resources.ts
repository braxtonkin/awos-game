export type Resource = {
  readonly id: string;
  readonly name: string;
  readonly perClick: number;
};

export const resources = [
  { id: "dirt", name: "Dirt", perClick: 1 },
  { id: "wood", name: "Wood", perClick: 1 },
  { id: "ironOre", name: "Iron ore", perClick: 1 },
  { id: "coal", name: "Coal", perClick: 1 },
  { id: "stone", name: "Stone", perClick: 1 },
  { id: "charcoal", name: "Charcoal", perClick: 0 },
  { id: "ironIngot", name: "Iron ingot", perClick: 0 },
  { id: "torch", name: "Torch", perClick: 0 },
  { id: "goldOre", name: "Gold ore", perClick: 1 },
  { id: "redstone", name: "Redstone", perClick: 1 },
  { id: "diamond", name: "Diamond", perClick: 1 },
  { id: "obsidian", name: "Obsidian", perClick: 1 },
  { id: "goldIngot", name: "Gold ingot", perClick: 0 },
  { id: "netherrack", name: "Netherrack", perClick: 1 },
  { id: "netherQuartz", name: "Nether quartz", perClick: 1 },
  { id: "ancientDebris", name: "Ancient debris", perClick: 1 },
  { id: "blazeRod", name: "Blaze rod", perClick: 1 },
  { id: "enderPearl", name: "Ender pearl", perClick: 1 },
  { id: "netheriteIngot", name: "Netherite ingot", perClick: 0 },
  { id: "blazePowder", name: "Blaze powder", perClick: 0 },
] as const satisfies readonly Resource[];

export type ResourceId = (typeof resources)[number]["id"];

export type Amounts = Partial<Record<ResourceId, number>>;
