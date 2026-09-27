import { expect, test } from "vitest";
import { decodeSave, loadSave, serialize } from "../src/save.ts";

test("serialize writes a version 2 save with its timestamp", () => {
  expect(serialize({ amounts: { dirt: 3 }, owned: {}, stats: { clicks: 0, ticks: 0, gathered: {} } }, 1234)).toBe(
    '{"version":2,"savedAt":1234,"state":{"amounts":{"dirt":3},"owned":{},"stats":{"clicks":0,"ticks":0,"gathered":{}}}}',
  );
});

test.each([
  ["v0", '{"amounts":{"dirt":12,"wood":30},"owned":{"woodenAxe":2}}', 0, null],
  ["v1", '{"state":{"amounts":{"dirt":12,"wood":30},"owned":{"woodenAxe":2}},"savedAt":1700000000000}', 1, 1700000000000],
  ["v2", '{"version":2,"savedAt":1700000000000,"state":{"amounts":{"dirt":12,"wood":30},"owned":{"woodenAxe":2}}}', 2, 1700000000000],
] as const)(
  "decodeSave migrates fixture %s",
  (_name, text, version, savedAt) => {
    expect(decodeSave(text)).toEqual({
      kind: "loaded",
      version,
      savedAt,
      state: { amounts: { dirt: 12, wood: 30 }, owned: { woodenAxe: 2 }, stats: { clicks: 0, ticks: 0, gathered: {} } },
    });
  },
);

test("decodeSave reports invalid and unsupported saves", () => {
  expect(decodeSave("not json")).toEqual({ kind: "invalid", reason: "The text is not valid JSON." });
  expect(decodeSave("[1,2]")).toEqual({ kind: "invalid", reason: "The text is not a saved game." });
  expect(decodeSave('{"version":3,"savedAt":1,"state":{}}')).toEqual({
    kind: "invalid",
    reason: "Save version 3 is newer than this game supports.",
  });
});

test("decodeSave drops unknown ids, negative values, and non-numbers", () => {
  expect(decodeSave('{"version":2,"savedAt":5,"state":{"amounts":{"dirt":-4,"wood":2,"unknownResource":9},"owned":{"woodenPickaxe":"1"}}}')).toEqual({
    kind: "loaded",
    version: 2,
    savedAt: 5,
    state: { amounts: { wood: 2 }, owned: {}, stats: { clicks: 0, ticks: 0, gathered: {} } },
  });
});

test("decodeSave preserves initial values for missing fields", () => {
  expect(decodeSave('{"version":2,"savedAt":5,"state":{"amounts":{"wood":2}}}')).toEqual({
    kind: "loaded",
    version: 2,
    savedAt: 5,
    state: { amounts: { wood: 2 }, owned: {}, stats: { clicks: 0, ticks: 0, gathered: {} } },
  });
});

test("loadSave starts a new game for null and invalid text", () => {
  expect(loadSave(null)).toEqual({ state: { amounts: {}, owned: {}, stats: { clicks: 0, ticks: 0, gathered: {} } }, savedAt: null });
  expect(loadSave("not json")).toEqual({ state: { amounts: {}, owned: {}, stats: { clicks: 0, ticks: 0, gathered: {} } }, savedAt: null });
});
