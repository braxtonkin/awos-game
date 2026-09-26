import type { Amounts } from "./resources.ts";

export type Upgrade = {
  readonly id: string;
  readonly name: string;
  readonly cost: Amounts;
  readonly perTick: Amounts;
  readonly uses: Amounts;
};

export const upgrades = [
  { id: "woodenPickaxe", name: "Wooden pickaxe", cost: { wood: 10 }, perTick: { dirt: 1 }, uses: {} },
  { id: "furnace", name: "Furnace", cost: { dirt: 20, wood: 10 }, perTick: { charcoal: 1 }, uses: { wood: 2 } },
] as const satisfies readonly Upgrade[];

export type UpgradeId = (typeof upgrades)[number]["id"];
