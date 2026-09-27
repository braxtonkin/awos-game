import { expect, test } from "vitest";
import { formatClickPower, toolDetails } from "../src/format.ts";
import { tools } from "../src/tools.ts";
import { serialize } from "../src/save.ts";
import { stateWith } from "./state.ts";
import { openPage } from "./page.ts";

test("formatClickPower renders click power", () => {
  expect(formatClickPower(1)).toBe("Click power: ×1");
});

test("toolDetails shows Stone and Iron pickaxe costs and click power", () => {
  expect(toolDetails(tools[0])).toEqual(["Cost: 40 Wood, 60 Stone", "Click power: ×2"]);
  expect(toolDetails(tools[1])).toEqual(["Cost: 1K Wood, 300 Iron ingot", "Click power: ×3"]);
});

test("new game displays click power ×1", () => {
  openPage();
  expect(document.querySelector(".click-power")?.textContent).toBe("Click power: ×1");
});

test("buying Stone pickaxe doubles Wood mining power", () => {
  openPage(serialize(stateWith({ amounts: { wood: 40, stone: 60 } }), 1_000_000));
  const button = document.querySelector<HTMLButtonElement>('[data-tool="stonePickaxe"] button');
  button?.click();
  expect(button?.textContent).toBe("Owned");
  expect(button?.disabled).toBe(true);
  expect(document.querySelector(".click-power")?.textContent).toBe("Click power: ×2");
  document.querySelector<HTMLButtonElement>('[data-resource="wood"] button')?.click();
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("2");
});
