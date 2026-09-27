import { expect, test } from "vitest";
import { formatAmount, formatAmounts, upgradeDetails, zoneDetails } from "../src/format.ts";
import { zones } from "../src/zones.ts";

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
