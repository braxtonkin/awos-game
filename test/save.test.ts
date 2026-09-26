import { expect, test } from "vitest";
import { catchUp } from "../src/game.ts";
import { deserialize, serialize } from "../src/save.ts";

test("serialize writes the state beside its save time", () => {
  expect(serialize({ amounts: { dirt: 3, wood: 1 }, owned: { woodenPickaxe: 2 } }, 1234)).toBe(
    '{"state":{"amounts":{"dirt":3,"wood":1},"owned":{"woodenPickaxe":2}},"savedAt":1234}',
  );
});

test("deserialize starts a new game when there is no save", () => {
  expect(deserialize(null)).toEqual({ state: { amounts: {}, owned: {} }, savedAt: null });
});

test("deserialize starts a new game when the save is not JSON", () => {
  expect(deserialize("not json")).toEqual({ state: { amounts: {}, owned: {} }, savedAt: null });
});

test("deserialize drops ids that no catalog lists", () => {
  expect(
    deserialize(
      '{"amounts":{"dirt":4,"unknownResource":9},"owned":{"woodenPickaxe":1,"unknownUpgrade":2}}',
    ),
  ).toEqual({ state: { amounts: { dirt: 4 }, owned: { woodenPickaxe: 1 } }, savedAt: null });
});

test("deserialize drops negative values", () => {
  expect(deserialize('{"amounts":{"dirt":-4,"wood":2},"owned":{"woodenPickaxe":-1}}')).toEqual({
    state: { amounts: { wood: 2 }, owned: {} },
    savedAt: null,
  });
});

test("deserialize drops values that are not numbers", () => {
  expect(deserialize('{"amounts":{"dirt":"4","wood":2},"owned":{"woodenPickaxe":"1"}}')).toEqual({
    state: { amounts: { wood: 2 }, owned: {} },
    savedAt: null,
  });
});

test("deserialize reads state and timestamp", () => {
  expect(deserialize('{"state":{"amounts":{"dirt":3},"owned":{}},"savedAt":1234}')).toEqual({
    state: { amounts: { dirt: 3 }, owned: {} },
    savedAt: 1234,
  });
});

test("an old state-only save loads without catch-up ticks", () => {
  const loaded = deserialize('{"amounts":{"dirt":0},"owned":{"woodenPickaxe":1}}');
  expect(loaded).toEqual({
    state: { amounts: { dirt: 0 }, owned: { woodenPickaxe: 1 } },
    savedAt: null,
  });
  expect(catchUp(loaded.state, loaded.savedAt === null ? 0 : 10000)).toEqual({
    amounts: { dirt: 0 },
    owned: { woodenPickaxe: 1 },
  });
});

test("a future save time loads without catch-up ticks", () => {
  const loaded = deserialize(
    '{"state":{"amounts":{"dirt":0},"owned":{"woodenPickaxe":1}},"savedAt":20000}',
  );
  const now = 10000;
  expect(catchUp(loaded.state, loaded.savedAt === null ? 0 : now - loaded.savedAt)).toEqual({
    amounts: { dirt: 0 },
    owned: { woodenPickaxe: 1 },
  });
});

test("deserialize ignores an invalid save time", () => {
  expect(deserialize('{"state":{"amounts":{"dirt":3},"owned":{}},"savedAt":"1234"}')).toEqual({
    state: { amounts: { dirt: 3 }, owned: {} },
    savedAt: null,
  });
});
