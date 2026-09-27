import { expect, test } from "vitest";
import { openPage } from "./page.ts";

test("tabs select Mine initially and show its sections", () => {
  openPage();
  expect([...document.querySelectorAll('[role="tab"]')].map((button) => button.textContent)).toEqual([
    "Mine", "Build", "Progress", "More",
  ]);
  expect([...document.querySelectorAll('[role="tab"]')].map((button) => button.getAttribute("aria-selected"))).toEqual([
    "true", "false", "false", "false",
  ]);
  expect(document.querySelector('[data-section="resources"]')?.hasAttribute("hidden")).toBe(false);
  expect(document.querySelector('[data-section="upgrades"]')?.hasAttribute("hidden")).toBe(true);
});

test("Build and More show their sections", () => {
  openPage();
  document.querySelector<HTMLButtonElement>('[role="tab"]:nth-child(2)')?.click();
  expect(document.querySelector('[data-section="upgrades"]')?.hasAttribute("hidden")).toBe(false);
  expect(document.querySelector('[data-section="resources"]')?.hasAttribute("hidden")).toBe(true);
  expect(document.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toBe("Build");
  document.querySelector<HTMLButtonElement>('[role="tab"]:nth-child(4)')?.click();
  expect(document.querySelector('[data-section="reset"]')?.hasAttribute("hidden")).toBe(false);
});
