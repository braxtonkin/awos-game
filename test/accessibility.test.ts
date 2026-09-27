import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { openPage } from "./page.ts";

const cavesSave = readFileSync("test/fixtures/saves/wave-2.json", "utf8");

test("row buttons have unique contextual names and tab controls work by keyboard", () => {
  openPage(cavesSave);
  for (const section of document.querySelectorAll<HTMLElement>("[data-section]")) {
    const names = [...section.querySelectorAll("button")].map((button) => button.getAttribute("aria-label") ?? button.textContent ?? "");
    expect(new Set(names).size, section.dataset.section).toBe(names.length);
  }
  const wood = document.querySelector<HTMLButtonElement>('[data-resource="wood"] button')!;
  expect(wood.getAttribute("aria-label")).toBe("Mine Wood");
  expect(wood.textContent).toBe("Mine");
  const axe = document.querySelector<HTMLButtonElement>('[data-upgrade="woodenAxe"] button')!;
  expect(axe.getAttribute("aria-label")).toBe("Buy Wooden axe");
  const torch = document.querySelector<HTMLButtonElement>('[data-recipe="torch"] button')!;
  expect(torch.getAttribute("aria-label")).toBe("Craft Torch");
  expect(document.querySelector('[data-zone="surface"] button')?.getAttribute("aria-label")).toBe("Reached Surface");
  expect(document.querySelector('[data-zone="caves"] button')?.getAttribute("aria-label")).toBe("Reached Caves");
  const mine = document.querySelector<HTMLButtonElement>('[role="tab"]')!;
  mine.focus();
  mine.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  expect(document.activeElement?.textContent).toBe("Build");
  expect(document.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toBe("Build");
  mine.focus();
  mine.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
  expect(document.activeElement?.textContent).toBe("More");
  expect(document.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toBe("More");
  expect(document.querySelector('[data-section="event"] .event-text')?.getAttribute("role")).toBe("status");
  expect(readFileSync("index.html", "utf8")).toContain("prefers-reduced-motion: reduce");
});
