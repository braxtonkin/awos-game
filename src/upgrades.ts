import type { Amounts } from "./resources.ts";

export type Upgrade = {
  readonly id: string;
  readonly name: string;
  readonly cost: Amounts;
  readonly perTick: Amounts;
};

export const upgrades = [
  { id: "woodenPickaxe", name: "Wooden pickaxe", cost: { wood: 10 }, perTick: { dirt: 1 } },
] as const satisfies readonly Upgrade[];

export type UpgradeId = (typeof upgrades)[number]["id"];
