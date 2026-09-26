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
] as const satisfies readonly Upgrade[];

export type UpgradeId = (typeof upgrades)[number]["id"];
