import { expect, test } from "vitest";
import { openPage } from "./page.ts";
import { serialize } from "../src/save.ts";
import { stateWith } from "./state.ts";

test("a deterministic random roll displays Rain after a page tick", () => {
  const { page } = openPage(undefined, { random: () => 0 });
  page.tick();
  expect(document.querySelector('[data-section="event"]')?.hasAttribute("hidden")).toBe(false);
  expect(document.querySelector(".event-text")?.textContent).toBe("Rain soaks the forest. Wood production is doubled.");
  expect(document.querySelector(".event-time")?.textContent).toBe("60s left");
});

test("the default random source leaves the event section hidden", () => {
  const { page } = openPage();
  page.tick();
  expect(document.querySelector('[data-section="event"]')?.hasAttribute("hidden")).toBe(true);
});

test("opening a treasure chest applies production", () => {
  const save = serialize(stateWith({ owned: { woodenAxe: 2 }, event: { id: "treasureChest", secondsLeft: 30 } }), 1_000_000);
  openPage(save);
  const button = document.querySelector('[data-section="event"] button') as HTMLButtonElement;
  expect(button.textContent).toBe("Open");
  button.click();
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("120");
});
