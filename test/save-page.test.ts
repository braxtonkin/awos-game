import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { decodeSave } from "../src/save.ts";
import { openPage } from "./page.ts";

const legacySave = readFileSync("test/fixtures/saves/v1.json", "utf8");

function amount(id: string): string {
  return document.querySelector(`[data-resource="${id}"] .amount`)?.textContent ?? "";
}

function click(selector: string): void {
  document.querySelector<HTMLButtonElement>(selector)?.click();
}

test("exports the current game as a versioned save", () => {
  openPage();
  click('[data-resource="wood"] button');
  click('[data-resource="wood"] button');
  click('[data-resource="wood"] button');
  click('[data-section="save"] button');
  const text = (document.querySelector("[data-export]") as HTMLTextAreaElement).value;
  expect(text.startsWith('{"version":2,')).toBe(true);
  const decoded = decodeSave(text);
  expect(decoded.kind).toBe("loaded");
  if (decoded.kind === "loaded") expect(decoded.state.amounts.wood).toBe(3);
});

test("invalid import displays its reason and preserves the game", () => {
  openPage();
  click('[data-resource="wood"] button');
  click('[data-resource="wood"] button');
  click('[data-resource="wood"] button');
  (document.querySelector("[data-import]") as HTMLTextAreaElement).value = "not json";
  click('[data-section="save"] button:last-of-type');
  expect(document.querySelector(".message")?.textContent).toBe("The text is not valid JSON.");
  expect(amount("wood")).toBe("3");
});

test("confirmed import replaces the game", () => {
  openPage(undefined, { confirm: () => true });
  (document.querySelector("[data-import]") as HTMLTextAreaElement).value = legacySave;
  click('[data-section="save"] button:last-of-type');
  expect(amount("wood")).toBe("30");
  expect(amount("dirt")).toBe("12");
  expect(document.querySelector('[data-upgrade="woodenAxe"]')?.textContent).toContain("Owned: 2");
  expect(document.querySelector(".message")?.textContent).toBe("Save imported.");
});

test("declined import preserves the game", () => {
  openPage(undefined, { confirm: () => false });
  click('[data-resource="wood"] button');
  click('[data-resource="wood"] button');
  click('[data-resource="wood"] button');
  (document.querySelector("[data-import]") as HTMLTextAreaElement).value = legacySave;
  click('[data-section="save"] button:last-of-type');
  expect(amount("wood")).toBe("3");
});
