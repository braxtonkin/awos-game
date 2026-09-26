import { expect, test } from "vitest";
import { deserialize, loadSave, serialize } from "../src/save.ts";

test("serialize writes the state as JSON", () => {
  expect(serialize({ amounts: { dirt: 3, wood: 1 }, owned: { woodenPickaxe: 2 } })).toBe(
    '{"amounts":{"dirt":3,"wood":1},"owned":{"woodenPickaxe":2}}',
  );
});

test("serialize writes the save timestamp beside the state", () => {
  expect(serialize({ amounts: { dirt: 3 }, owned: {} }, 1234)).toBe(
    '{"state":{"amounts":{"dirt":3},"owned":{}},"savedAt":1234}',
  );
});

test("loadSave accepts an older save without a timestamp", () => {
  expect(loadSave('{"amounts":{"dirt":1},"owned":{"woodenPickaxe":1}}')).toEqual({
    state: { amounts: { dirt: 1 }, owned: { woodenPickaxe: 1 } },
    savedAt: null,
  });
});

test("loadSave exposes a future timestamp as data without changing the saved state", () => {
  expect(loadSave('{"state":{"amounts":{"dirt":1},"owned":{"woodenPickaxe":1}},"savedAt":9999}')).toEqual({
    state: { amounts: { dirt: 1 }, owned: { woodenPickaxe: 1 } },
    savedAt: 9999,
  });
});

test("deserialize starts a new game when there is no save", () => {
  expect(deserialize(null)).toEqual({ amounts: {}, owned: {} });
});

test("deserialize starts a new game when the save is not JSON", () => {
  expect(deserialize("not json")).toEqual({ amounts: {}, owned: {} });
});

test("deserialize drops ids that no catalog lists", () => {
  expect(
    deserialize(
      '{"amounts":{"dirt":4,"unknownResource":9},"owned":{"woodenPickaxe":1,"unknownUpgrade":2}}',
    ),
  ).toEqual({ amounts: { dirt: 4 }, owned: { woodenPickaxe: 1 } });
});

test("deserialize gives iron ore zero when loading a save from before it existed", () => {
  expect(deserialize('{"amounts":{"dirt":4,"wood":2},"owned":{}}')).toEqual({
    amounts: { dirt: 4, wood: 2 },
    owned: {},
  });
});

test("deserialize gives stone zero when loading a save from before it existed", () => {
  expect(deserialize('{"amounts":{"dirt":4,"wood":2},"owned":{}}')).toEqual({
    amounts: { dirt: 4, wood: 2 },
    owned: {},
  });
});

test("deserialize drops negative values", () => {
  expect(deserialize('{"amounts":{"dirt":-4,"wood":2},"owned":{"woodenPickaxe":-1}}')).toEqual({
    amounts: { wood: 2 },
    owned: {},
  });
});

test("deserialize drops values that are not numbers", () => {
  expect(deserialize('{"amounts":{"dirt":"4","wood":2},"owned":{"woodenPickaxe":"1"}}')).toEqual({
    amounts: { wood: 2 },
    owned: {},
  });
});
