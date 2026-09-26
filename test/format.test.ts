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
