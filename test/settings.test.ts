import { expect, test } from "vitest";
import { formatAmount } from "../src/format.ts";
import { defaultSettings, parseSettings } from "../src/settings.ts";
import { openPage } from "./page.ts";
import { deserialize } from "../src/save.ts";

test("settings parsing keeps known values and defaults invalid values", () => {
  expect(parseSettings(null)).toEqual(defaultSettings);
  expect(parseSettings('{"numbers":"full","theme":"sepia"}')).toEqual({ numbers: "full", theme: "system" });
});

test("number formats use full grouping and floored scientific notation", () => {
  expect(formatAmount(1234567.8, "full")).toBe("1,234,567");
  expect(formatAmount(1234, "full")).toBe("1,234");
  expect(formatAmount(1234, "scientific")).toBe("1.23e3");
  expect(formatAmount(1500000, "scientific")).toBe("1.5e6");
  expect(formatAmount(2e15, "scientific")).toBe("2e15");
  expect(formatAmount(999.9, "scientific")).toBe("999");
});

test("settings control number display, persist, and restore on reopen", () => {
  const { storage } = openPage(JSON.stringify({ amounts: { wood: 1234 } }));
  document.querySelector<HTMLButtonElement>('[role="tab"]:nth-child(4)')?.click();
  const numbers = document.querySelector<HTMLSelectElement>('select[aria-label="Numbers"]')!;
  numbers.value = "full";
  numbers.dispatchEvent(new Event("change"));
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("1,234");
  expect(storage.getItem("awos-game:settings")).toBe('{"numbers":"full","theme":"system"}');
  expect(deserialize(storage.getItem("awos-game:save")).amounts.wood).toBe(1234);
  openPage(JSON.stringify({ amounts: { wood: 1234 } }), {}, storage.getItem("awos-game:settings")!);
  expect(document.querySelector('[data-resource="wood"] .amount')?.textContent).toBe("1,234");
});

test("theme control applies explicit theme and system selection removes it", () => {
  openPage();
  document.querySelector<HTMLButtonElement>('[role="tab"]:nth-child(4)')?.click();
  const theme = document.querySelector<HTMLSelectElement>('select[aria-label="Theme"]')!;
  theme.value = "dark";
  theme.dispatchEvent(new Event("change"));
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  theme.value = "system";
  theme.dispatchEvent(new Event("change"));
  expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
});
