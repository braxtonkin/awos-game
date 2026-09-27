import { expect, test } from "vitest";
import { stateWith } from "./state.ts";

test("stateWith replaces the supplied fields on the initial state", () => {
  expect(stateWith({ amounts: { wood: 5 } })).toMatchObject({ amounts: { wood: 5 }, owned: {} });
});
