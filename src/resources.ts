export type Resource = {
  readonly id: string;
  readonly name: string;
  readonly perClick: number;
};

export const resources = [
  { id: "dirt", name: "Dirt", perClick: 1 },
  { id: "wood", name: "Wood", perClick: 1 },
  { id: "ironOre", name: "Iron ore", perClick: 1 },
] as const satisfies readonly Resource[];

export type ResourceId = (typeof resources)[number]["id"];

export type Amounts = Partial<Record<ResourceId, number>>;
