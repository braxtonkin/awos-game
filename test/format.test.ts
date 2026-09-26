import { expect, test } from "vitest";
import { formatAmount, formatAmounts, upgradeDetails } from "../src/format.ts";

test("formatAmount abbreviates large amounts without rounding up", () => {
  expect(formatAmount(0)).toBe("0");
  expect(formatAmount(999)).toBe("999");
  expect(formatAmount(1000)).toBe("1K");
  expect(formatAmount(1234)).toBe("1.2K");
  expect(formatAmount(999999)).toBe("999.9K");
  expect(formatAmount(1500000)).toBe("1.5M");
  expect(formatAmount(2000000000)).toBe("2B");
});

test("formatAmounts lists amounts in resource order, whatever the key order", () => {
  expect(formatAmounts({ wood: 10, dirt: 20 })).toBe("20 Dirt, 10 Wood");
  expect(formatAmounts({ dirt: 1234 })).toBe("1.2K Dirt");
});

test("upgradeDetails abbreviates upgrade costs", () => {
  expect(
    upgradeDetails({ id: "woodenPickaxe", name: "Wooden pickaxe", cost: { wood: 1500 }, perTick: { dirt: 1 } }),
  ).toEqual(["Cost: 1.5K Wood", "Makes: 1 Dirt per second"]);
});

test("upgradeDetails shows the cost and what the upgrade makes each second", () => {
  expect(
    upgradeDetails({ id: "woodenPickaxe", name: "Wooden pickaxe", cost: { wood: 10 }, perTick: { dirt: 1 } }),
  ).toEqual(["Cost: 10 Wood", "Makes: 1 Dirt per second"]);
});

test("upgradeDetails shows the wooden axe cost and wood production", () => {
  expect(
    upgradeDetails({ id: "woodenAxe", name: "Wooden axe", cost: { wood: 15 }, perTick: { wood: 1 } }),
  ).toEqual(["Cost: 15 Wood", "Makes: 1 Wood per second"]);
});
