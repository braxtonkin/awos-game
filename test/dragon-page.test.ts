import { expect, test } from "vitest";
import { openPage } from "./page.ts";
import { serialize } from "../src/save.ts";
import { stateWith } from "./state.ts";

test("attacking the Ender Dragon shows the victory message", () => {
  openPage(serialize(stateWith({ owned: { end: 1 }, dragonHealth: 20 }), 1000000));
  document.querySelector<HTMLButtonElement>('[aria-label="Attack Ender Dragon"]')?.click();
  expect(document.querySelector('[data-section="dragon"]')?.textContent).toContain("You defeated the Ender Dragon!");
});
