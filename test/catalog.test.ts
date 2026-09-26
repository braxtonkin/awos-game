import { expect, test } from "vitest";
import { resources } from "../src/resources.ts";
import { upgrades } from "../src/upgrades.ts";

test("resource ids are unique", () => {
  const ids = resources.map((resource) => resource.id);
  expect(ids).toEqual([...new Set(ids)]);
});

test("upgrade ids are unique", () => {
  const ids = upgrades.map((upgrade) => upgrade.id);
  expect(ids).toEqual([...new Set(ids)]);
});
