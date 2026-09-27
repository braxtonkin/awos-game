import { expect, test } from "vitest";
import { buy, tick } from "../src/game.ts";
import { stateWith } from "./state.ts";

test("three quarries produce 6 stone per tick", () => {
  expect(tick(stateWith({ owned: { quarry: 3 } })).amounts).toEqual({ stone: 6 });
});

test("two coal mines produce 2 coal per tick", () => {
  expect(tick(stateWith({ owned: { coalMine: 2 } })).amounts).toEqual({ coal: 2 });
});

test("buying a quarry spends 30 dirt and 30 wood", () => {
  const result = buy(stateWith({ amounts: { dirt: 30, wood: 30 } }), "quarry");
  expect(result.amounts).toEqual({ dirt: 0, wood: 0 });
  expect(result.owned).toEqual({ quarry: 1 });
});
