import { expect, test } from "vitest";
import { openPage } from "./page.ts";
import { deserialize } from "../src/save.ts";

test("new game displays zero wood and one Mine button", () => {
  openPage();
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("0");
  expect(document.querySelector('[data-resource="wood"] button')?.textContent).toBe("Mine");
});

test("new game shows only discovered rows", () => {
  openPage();
  const visibleIds = (selector: string, attribute: string) => [...document.querySelectorAll<HTMLElement>(selector)]
    .filter((row) => !row.hidden)
    .map((row) => row.dataset[attribute]);
  expect(visibleIds("[data-resource]", "resource")).toEqual(["dirt", "wood", "coal", "stone"]);
  expect(visibleIds("[data-upgrade]", "upgrade")).toEqual(["woodenPickaxe", "woodenAxe", "furnace", "quarry", "coalMine"]);
  expect(visibleIds("[data-tool]", "tool")).toEqual(["stonePickaxe"]);
  expect(visibleIds("[data-zone]", "zone")).toEqual(["surface", "caves"]);
  expect(visibleIds("[data-recipe]", "recipe")).toEqual(["torch"]);
});

test("new game locks iron ore and shows Caves as unavailable", () => {
  openPage();
  const ironButton = document.querySelector<HTMLButtonElement>('[data-resource="ironOre"] button');
  const cavesButton = document.querySelector<HTMLButtonElement>('[data-zone="caves"] button');
  expect(ironButton?.textContent).toBe("Locked");
  expect(ironButton?.disabled).toBe(true);
  expect(cavesButton?.textContent).toBe("Explore");
  expect(cavesButton?.disabled).toBe(true);
});

test("exploring Caves unlocks iron ore and keeps saved iron ore visible", () => {
  openPage(JSON.stringify({ amounts: { torch: 400, stone: 1500, ironOre: 5 }, owned: { stonePickaxe: 1 } }));
  document.querySelector<HTMLButtonElement>('[data-zone="caves"] button')?.click();
  expect(document.querySelector('[data-zone="caves"] button')?.textContent).toBe("Reached");
  expect(document.querySelector('[data-resource="ironOre"] button')?.textContent).toBe("Mine");
  expect(document.querySelector('[data-resource="ironOre"] .amount')?.textContent).toBe("5");
  document.querySelector<HTMLButtonElement>('[data-resource="ironOre"] button')?.click();
  expect(document.querySelector('[data-resource="ironOre"] .amount')?.textContent).toBe("7");
});

test("saved iron ore stays visible but locked before Caves are reached", () => {
  openPage(JSON.stringify({ amounts: { ironOre: 5 }, owned: {} }));
  const row = document.querySelector<HTMLElement>('[data-resource="ironOre"]');
  expect(row?.hidden).toBe(false);
  expect(row?.querySelector("button")?.textContent).toBe("Locked");
});

test("mining wood updates the page and persisted save", () => {
  const { storage } = openPage();
  document.querySelector<HTMLButtonElement>('[data-resource="wood"] button')?.click();
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("1");
  expect(deserialize(storage.getItem("awos-game:save"))).toEqual({ amounts: { wood: 1 }, owned: {}, paused: [], stats: { clicks: 1, ticks: 0, gathered: { wood: 1 } }, lifetime: { clicks: 0, ticks: 0, gathered: 0, records: {} }, event: null, achievements: ["firstLog"], prestige: { emeralds: 0, worlds: 0, perks: [] } });
});

test("buying a wooden axe spends wood and shows it owned", () => {
  openPage(JSON.stringify({ amounts: { wood: 15 }, owned: {} }));
  document.querySelector<HTMLButtonElement>('[data-upgrade="woodenAxe"] button')?.click();
  expect(document.querySelector('[data-upgrade="woodenAxe"]')?.textContent).toContain("Owned: 1");
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("0");
});

test("upgrade cost and availability update at the next axe price", () => {
  openPage(JSON.stringify({ amounts: { wood: 17 }, owned: { woodenAxe: 1 } }));
  expect(document.querySelector('[data-upgrade="woodenAxe"]')?.textContent).toContain("Cost: 18 Wood");
  expect(document.querySelector<HTMLButtonElement>('[data-upgrade="woodenAxe"] button')?.disabled).toBe(true);
  openPage(JSON.stringify({ amounts: { wood: 18 }, owned: { woodenAxe: 1 } }));
  expect(document.querySelector('[data-upgrade="woodenAxe"]')?.textContent).toContain("Cost: 18 Wood");
  expect(document.querySelector<HTMLButtonElement>('[data-upgrade="woodenAxe"] button')?.disabled).toBe(false);
});

test("one page tick produces wood from two wooden axes", () => {
  const { page } = openPage(JSON.stringify({ amounts: {}, owned: { woodenAxe: 2 } }));
  page.tick();
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("2");
});

test("sections appear in page order", () => {
  openPage();
  expect([...document.querySelectorAll("main h2")].map((heading) => heading.textContent)).toEqual([
    "Next goal", "Event", "Resources", "Tools", "Zones", "Upgrades", "Crafting", "Stats", "Achievements", "New world", "Save", "Settings", "How to play", "Game",
  ]);
});

test("crafting consumes ingredients, produces Torch, and disables the button", () => {
  openPage(JSON.stringify({ amounts: { wood: 1, coal: 1 }, owned: {} }));
  const button = document.querySelector<HTMLButtonElement>('[data-recipe="torch"] button');
  button?.click();
  expect(document.querySelector('[data-resource="torch"] .amount')?.textContent).toBe("4");
  expect(document.querySelector('[data-resource="coal"] .amount')?.textContent).toBe("0");
  expect(button?.disabled).toBe(true);
});

test("crafting Torch reveals its resource row", () => {
  openPage(JSON.stringify({ amounts: { wood: 1, coal: 1 }, owned: {} }));
  expect(document.querySelector<HTMLElement>('[data-resource="torch"]')?.hidden).toBe(true);
  document.querySelector<HTMLButtonElement>('[data-recipe="torch"] button')?.click();
  expect(document.querySelector<HTMLElement>('[data-resource="torch"]')?.hidden).toBe(false);
});

test("Quarry, Coal mine, and automation machines follow Furnace in the upgrades list", () => {
  openPage();
  expect([...document.querySelectorAll("[data-upgrade] .name")].map((name) => name.textContent)).toEqual([
    "Wooden pickaxe", "Wooden axe", "Furnace", "Quarry", "Coal mine", "Iron mine", "Smelter", "Torch workshop",
    "Gold mine", "Gold smelter", "Lava pump", "Diamond drill", "Blaze farm", "Enderman farm", "Debris drill",
  ]);
});

test("stats update after mining three times", () => {
  openPage();
  const mine = document.querySelector<HTMLButtonElement>('[data-resource="wood"] button');
  mine?.click(); mine?.click(); mine?.click();
  const stats = document.querySelector('[data-section="stats"]')?.textContent;
  expect(stats).toContain("Clicks: 3");
  expect(stats).toContain("Wood gathered: 3");
});

test("declining reset keeps progress", () => {
  openPage(undefined, { confirm: () => false });
  document.querySelector<HTMLButtonElement>('[data-resource="wood"] button')?.click();
  document.querySelector<HTMLButtonElement>('[data-section="reset"] button')?.click();
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("1");
});

test("confirming reset clears resources and upgrades", () => {
  openPage();
  document.querySelector<HTMLButtonElement>('[data-resource="wood"] button')?.click();
  document.querySelector<HTMLButtonElement>('[data-section="reset"] button')?.click();
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("0");
  expect([...document.querySelectorAll('[data-upgrade]')].every((row) => row.textContent?.includes("Owned: 0"))).toBe(true);
});
