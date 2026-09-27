import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { decodeSave } from "../src/save.ts";
import { resources } from "../src/resources.ts";
import { upgrades } from "../src/upgrades.ts";
import { tools } from "../src/tools.ts";
import { zones } from "../src/zones.ts";

const directory = join(process.cwd(), "test/fixtures/saves");
for (const file of readdirSync(directory).filter((name) => name.endsWith(".json"))) {
  test(`save fixture ${file} preserves known counts`, () => {
    const text = readFileSync(join(directory, file), "utf8");
    const decoded = decodeSave(text);
    expect(decoded.kind).toBe("loaded");
    if (decoded.kind !== "loaded") return;
    const original = JSON.parse(text) as { state?: { amounts?: Record<string, unknown>; owned?: Record<string, unknown> } };
    for (const item of resources) {
      if (Object.hasOwn(original.state?.amounts ?? {}, item.id)) expect(decoded.state.amounts[item.id]).toBe(original.state?.amounts?.[item.id]);
    }
    for (const item of [...upgrades, ...tools, ...zones]) {
      if (Object.hasOwn(original.state?.owned ?? {}, item.id)) expect(decoded.state.owned[item.id]).toBe(original.state?.owned?.[item.id]);
    }
  });
}
