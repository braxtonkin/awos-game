import type { Amounts } from "./resources.ts";

export type Upgrade = {
  readonly id: string;
  readonly name: string;
  readonly cost: Amounts;
  readonly perTick: Amounts;
  readonly uses?: Amounts | undefined;
};

export const upgrades = [
  { id: "woodenPickaxe", name: "Wooden pickaxe", cost: { wood: 10 }, perTick: { dirt: 1 }, uses: undefined },
  { id: "woodenAxe", name: "Wooden axe", cost: { wood: 15 }, perTick: { wood: 1 }, uses: undefined },
  { id: "furnace", name: "Furnace", cost: { dirt: 20, wood: 10 }, perTick: { charcoal: 1 }, uses: { wood: 2 } },
  { id: "quarry", name: "Quarry", cost: { dirt: 30, wood: 30 }, perTick: { stone: 2 }, uses: undefined },
  { id: "coalMine", name: "Coal mine", cost: { dirt: 60, stone: 60 }, perTick: { coal: 1 }, uses: undefined },
  { id: "ironMine", name: "Iron mine", cost: { stone: 400, torch: 50 }, perTick: { ironOre: 2 }, uses: undefined },
  { id: "smelter", name: "Smelter", cost: { stone: 300, ironIngot: 20 }, perTick: { ironIngot: 2 }, uses: { ironOre: 2, charcoal: 1 } },
  { id: "torchWorkshop", name: "Torch workshop", cost: { wood: 300, ironIngot: 10 }, perTick: { torch: 4 }, uses: { coal: 1, wood: 1 } },
] as const satisfies readonly Upgrade[];

export type UpgradeId = (typeof upgrades)[number]["id"];
