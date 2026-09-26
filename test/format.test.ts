import { expect, test } from "vitest";
import { formatAmounts, upgradeDetails } from "../src/format.ts";

test("formatAmounts lists amounts in resource order, whatever the key order", () => {
  expect(formatAmounts({ wood: 10, dirt: 20 })).toBe("20 Dirt, 10 Wood");
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

test("upgradeDetails shows the Furnace cost, use, and charcoal production", () => {
  expect(
    upgradeDetails({
      id: "furnace",
      name: "Furnace",
      cost: { dirt: 20, wood: 10 },
      uses: { wood: 2 },
      perTick: { charcoal: 1 },
    }),
  ).toEqual(["Cost: 20 Dirt, 10 Wood", "Uses: 2 Wood per second", "Makes: 1 Charcoal per second"]);
});
