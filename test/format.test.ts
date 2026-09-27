import { expect, test } from "vitest";
import { formatAmount, formatAmounts, formatDuration, upgradeDetails, zoneDetails } from "../src/format.ts";
import { zones } from "../src/zones.ts";
import { recipeDetails } from "../src/format.ts";
import { recipes } from "../src/recipes.ts";

test.each([[59, "59s"], [249, "4m 09s"], [3900, "1h 05m"]] as const)("formatDuration(%i)", (seconds, expected) => {
  expect(formatDuration(seconds)).toBe(expected);
});

test("formatAmount uses short suffixes and rounds down to one decimal place", () => {
  expect(formatAmount(0)).toBe("0");
  expect(formatAmount(999)).toBe("999");
  expect(formatAmount(1000)).toBe("1K");
  expect(formatAmount(1234)).toBe("1.2K");
  expect(formatAmount(999999)).toBe("999.9K");
  expect(formatAmount(1500000)).toBe("1.5M");
  expect(formatAmount(2000000000)).toBe("2B");
});

test("formatAmounts shortens resource amounts", () => {
  expect(formatAmounts({ dirt: 1234 })).toBe("1.2K Dirt");
});

test("formatAmounts lists amounts in resource order, whatever the key order", () => {
  expect(formatAmounts({ wood: 10, dirt: 20 })).toBe("20 Dirt, 10 Wood");
});

test("upgradeDetails shows the cost and what the upgrade makes each second", () => {
  expect(
    upgradeDetails({ id: "woodenPickaxe", name: "Wooden pickaxe", cost: { wood: 10 }, perTick: { dirt: 1 } }, { wood: 10 }),
  ).toEqual(["Cost: 10 Wood", "Makes: 1 Dirt per second"]);
});

test("upgradeDetails shows the wooden axe cost and wood production", () => {
  expect(
    upgradeDetails({ id: "woodenAxe", name: "Wooden axe", cost: { wood: 1500 }, perTick: { wood: 1 } }, { wood: 1500 }),
  ).toEqual(["Cost: 1.5K Wood", "Makes: 1 Wood per second"]);
});

test("upgradeDetails shows the Furnace cost, use, and charcoal production", () => {
  expect(
    upgradeDetails({
      id: "furnace",
      name: "Furnace",
      cost: { dirt: 20, wood: 10 },
      uses: { wood: 2 },
      perTick: { charcoal: 1 },
    }, { dirt: 20, wood: 10 }),
  ).toEqual(["Cost: 20 Dirt, 10 Wood", "Uses: 2 Wood per second", "Makes: 1 Charcoal per second"]);
});

test("zoneDetails lists the Caves cost, requirement, and resources", () => {
  expect(zoneDetails(zones[1]!)).toEqual([
    "Cost: 1.5K Stone, 400 Torch", "Needs: Stone pickaxe", "Mines: Iron ore",
  ]);
});

test("zoneDetails lists Surface resources", () => {
  expect(zoneDetails(zones[0]!)).toEqual(["Mines: Dirt, Wood, Coal, Stone"]);
});

test("zoneDetails lists the Deep caves cost, requirement, and resources", () => {
  expect(zoneDetails(zones[2]!)).toEqual([
    "Cost: 8K Stone, 1K Iron ingot, 2K Torch", "Needs: Iron pickaxe", "Mines: Gold ore, Redstone, Diamond, Obsidian",
  ]);
});

test("zoneDetails lists the Nether cost, requirement, and resources", () => {
  expect(zoneDetails(zones[3]!)).toEqual([
    "Cost: 6K Iron ingot, 1.5K Obsidian, 1K Gold ingot", "Needs: Diamond pickaxe", "Mines: Netherrack, Nether quartz, Ancient debris, Blaze rod, Ender pearl",
  ]);
});

test("recipeDetails shows the Torch and Iron ingot inputs and outputs", () => {
  expect(recipeDetails(recipes[0])).toEqual(["Uses: 1 Wood, 1 Coal", "Makes: 4 Torch"]);
  expect(recipeDetails(recipes[1])).toEqual(["Uses: 1 Iron ore, 1 Coal", "Makes: 1 Iron ingot"]);
});
