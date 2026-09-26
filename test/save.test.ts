import { expect, test } from "vitest";
import { deserialize, serialize } from "../src/save.ts";

test("serialize writes the state as JSON", () => {
  expect(serialize({ amounts: { dirt: 3, wood: 1 }, owned: { woodenPickaxe: 2 } })).toBe(
    '{"amounts":{"dirt":3,"wood":1},"owned":{"woodenPickaxe":2}}',
  );
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
