import { expect, test } from "vitest";
import { openPage } from "./page.ts";

test("How to play is available on More", () => {
  openPage();
  [...document.querySelectorAll("[role=tab]")].find((tab) => tab.textContent === "More")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

  const section = document.querySelector('[data-section="help"]');
  expect(section?.hasAttribute("hidden")).toBe(false);
  expect(section?.querySelectorAll("p")[0]?.textContent).toBe("Click Mine to gather a resource by hand. Better pickaxes mine more with every click.");
  expect(section?.querySelectorAll("p")[5]?.textContent).toBe("Once a world has gathered 100K resources, start a new world for Emeralds. Each Emerald makes the next world 10% faster.");
});
