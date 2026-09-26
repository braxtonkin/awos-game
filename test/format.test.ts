import { expect, test } from "vitest";
import { formatAmount, formatAmounts, upgradeDetails } from "../src/format.ts";

test.each([
  [0, "0"],
  [999, "999"],
  [1000, "1K"],
  [1234, "1.2K"],
  [999999, "999.9K"],
  [1500000, "1.5M"],
  [2000000000, "2B"],
])("formatAmount formats %i as %s", (amount, expected) => {
  expect(formatAmount(amount)).toBe(expected);
});

test("formatAmounts lists amounts in resource order, whatever the key order", () => {
  expect(formatAmounts({ wood: 10, dirt: 20 })).toBe("20 Dirt, 10 Wood");
});

test("formatAmounts compacts resource amounts", () => {
  expect(formatAmounts({ dirt: 1234 })).toBe("1.2K Dirt");
});

test("upgradeDetails shows the cost and what the upgrade makes each second", () => {
  expect(
    upgradeDetails({ id: "woodenPickaxe", name: "Wooden pickaxe", cost: { wood: 10 }, perTick: { dirt: 1 } }),
  ).toEqual(["Cost: 10 Wood", "Makes: 1 Dirt per second"]);
});

test("upgradeDetails compacts upgrade costs", () => {
  expect(
    upgradeDetails({ id: "woodenPickaxe", name: "Wooden pickaxe", cost: { wood: 1500 }, perTick: { dirt: 1 } })[0],
  ).toBe("Cost: 1.5K Wood");
});
