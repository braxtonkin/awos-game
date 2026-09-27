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
  { id: "goldMine", name: "Gold mine", cost: { ironIngot: 200, torch: 200 }, perTick: { goldOre: 2 }, uses: undefined },
  { id: "goldSmelter", name: "Gold smelter", cost: { stone: 1000, goldIngot: 20 }, perTick: { goldIngot: 2 }, uses: { goldOre: 2, coal: 1 } },
  { id: "lavaPump", name: "Lava pump", cost: { ironIngot: 400, redstone: 100 }, perTick: { obsidian: 1 }, uses: undefined },
  { id: "diamondDrill", name: "Diamond drill", cost: { ironIngot: 600, redstone: 200 }, perTick: { diamond: 1 }, uses: undefined },
  { id: "blazeFarm", name: "Blaze farm", cost: { netherrack: 300, obsidian: 50 }, perTick: { blazeRod: 2 }, uses: undefined },
  { id: "endermanFarm", name: "Enderman farm", cost: { netherrack: 300, netherQuartz: 100 }, perTick: { enderPearl: 2 }, uses: undefined },
  { id: "debrisDrill", name: "Debris drill", cost: { diamond: 200, netherQuartz: 200 }, perTick: { ancientDebris: 1 }, uses: undefined },
  { id: "ironGolem", name: "Iron golem", cost: { ironIngot: 3000, endStone: 500 }, perTick: {}, uses: undefined },
] as const satisfies readonly Upgrade[];

export type UpgradeId = (typeof upgrades)[number]["id"];
