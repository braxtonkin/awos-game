import { expect, test } from "vitest";
import { nextGoal } from "../src/format.ts";
import { stateWith } from "./state.ts";
import { openPage } from "./page.ts";

test("nextGoal follows tool and zone progression", () => {
  expect(nextGoal(stateWith({}))).toBe("Next goal: Stone pickaxe. Costs 40 Wood, 60 Stone.");
  expect(nextGoal(stateWith({ owned: { stonePickaxe: 1 } }))).toBe("Next goal: Caves. Costs 1.5K Stone, 400 Torch.");
  expect(nextGoal(stateWith({ owned: { stonePickaxe: 1, caves: 1 } }))).toBe("Next goal: Iron pickaxe. Costs 1K Wood, 300 Iron ingot.");
});

test("nextGoal reports the Ender Dragon after all tools and zones", () => {
  expect(nextGoal(stateWith({ owned: { stonePickaxe: 1, ironPickaxe: 1, diamondPickaxe: 1, netheritePickaxe: 1, caves: 1, deepCaves: 1, nether: 1, end: 1 } })))
    .toBe("Next goal: Defeat the Ender Dragon.");
});

test("Mine starts with the next goal hint", () => {
  openPage();
  expect(document.querySelector(".next-goal")?.textContent).toBe("Next goal: Stone pickaxe. Costs 40 Wood, 60 Stone.");
  expect(document.querySelector('[data-section="hint"] h2')?.textContent).toBe("Next goal");
  expect(document.querySelector('[role="tabpanel"] h2')?.textContent).toBe("Next goal");
});
