import { expect, test } from "vitest";
import { openPage } from "./page.ts";
import { stateWith } from "./state.ts";

test("new game shows Iron ore locked and Caves unavailable", () => {
  openPage();
  const ironButton = document.querySelector<HTMLButtonElement>('[data-resource="ironOre"] button');
  const cavesButton = document.querySelector<HTMLButtonElement>('[data-zone="caves"] button');
  expect(ironButton?.textContent).toBe("Locked");
  expect(ironButton?.disabled).toBe(true);
  expect(cavesButton?.textContent).toBe("Explore");
  expect(cavesButton?.disabled).toBe(true);
});

test("exploring Caves unlocks mining Iron ore", () => {
  openPage(JSON.stringify(stateWith({ amounts: { torch: 400, stone: 1500 }, owned: { stonePickaxe: 1 } })));
  const cavesButton = document.querySelector<HTMLButtonElement>('[data-zone="caves"] button');
  expect(cavesButton?.textContent).toBe("Explore");
  expect(cavesButton?.disabled).toBe(false);
  cavesButton?.click();
  expect(cavesButton?.textContent).toBe("Reached");
  const ironButton = document.querySelector<HTMLButtonElement>('[data-resource="ironOre"] button');
  expect(ironButton?.textContent).toBe("Mine");
  ironButton?.click();
  expect(document.querySelector('[data-resource="ironOre"] .amount')?.textContent).toBe("2");
});

test("existing Iron ore remains visible before reaching Caves", () => {
  openPage(JSON.stringify(stateWith({ amounts: { ironOre: 5 } })));
  expect(document.querySelector('[data-resource="ironOre"] .amount')?.textContent).toBe("5");
});

test("Zones appears between tools and upgrades in the section order", () => {
  openPage();
  expect([...document.querySelectorAll("main h2")].map((heading) => heading.textContent)).toEqual([
    "Resources", "Tools", "Zones", "Upgrades", "Game",
  ]);
});
