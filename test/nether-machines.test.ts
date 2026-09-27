import { expect, test } from "vitest";
import { tick } from "../src/game.ts";
import { stateWith } from "./state.ts";

test("Nether farms and drills produce resources each tick", () => {
  expect(tick(stateWith({ owned: { blazeFarm: 2, endermanFarm: 1, debrisDrill: 3 } })).amounts).toEqual({ blazeRod: 4, enderPearl: 2, ancientDebris: 3 });
});
