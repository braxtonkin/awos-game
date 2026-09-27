import { expect, test } from "vitest";
import { openPage } from "./page.ts";
import { deserialize } from "../src/save.ts";

test("new game displays zero wood and one Mine button", () => {
  openPage();
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("0");
  expect(document.querySelector('[data-resource="wood"] button')?.textContent).toBe("Mine");
});

test("mining wood updates the page and persisted save", () => {
  const { storage } = openPage();
  document.querySelector<HTMLButtonElement>('[data-resource="wood"] button')?.click();
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("1");
  expect(deserialize(storage.getItem("awos-game:save"))).toEqual({ amounts: { wood: 1 }, owned: {} });
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
    "Resources", "Upgrades", "Game",
  ]);
});

test("declining reset keeps progress", () => {
  openPage(undefined, { confirm: () => false });
  document.querySelector<HTMLButtonElement>('[data-resource="wood"] button')?.click();
  document.querySelector<HTMLButtonElement>('[data-section="game"] button')?.click();
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("1");
});

test("confirming reset clears resources and upgrades", () => {
  openPage();
  document.querySelector<HTMLButtonElement>('[data-resource="wood"] button')?.click();
  document.querySelector<HTMLButtonElement>('[data-section="game"] button')?.click();
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("0");
  expect([...document.querySelectorAll('[data-upgrade]')].every((row) => row.textContent?.includes("Owned: 0"))).toBe(true);
});
