import { expect, test } from "vitest";
import { catchUp, mine, resolveEvent, rollEvent, tick } from "../src/game.ts";
import { events, eventChance } from "../src/events.ts";
import { stateWith } from "./state.ts";

test("event catalog defines Rain and Haste", () => {
  expect(eventChance).toBe(1 / 180);
  expect(events).toEqual([
    { id: "rain", name: "Rain", text: "Rain soaks the forest. Wood production is doubled.", seconds: 60, effect: { kind: "production", resource: "wood", factor: 2 } },
  { id: "haste", name: "Haste", text: "Haste! Every click mines three times as much.", seconds: 30, effect: { kind: "clickPower", factor: 3 } },
  { id: "treasureChest", name: "Treasure chest", text: "A treasure chest! Open it for a minute of production.", seconds: 30, effect: { kind: "chest", seconds: 60 } },
  { id: "creeper", name: "Creeper", text: "A Creeper is coming! Defuse it, or lose a tenth of your Stone and Dirt.", seconds: 15, effect: { kind: "creeper", share: 0.1, resources: ["stone", "dirt"] } },
  { id: "wanderingTrader", name: "Wandering trader", text: "A wandering trader offers 20 Iron ingots for 500 Wood.", seconds: 60, effect: { kind: "trade", give: { wood: 500 }, get: { ironIngot: 20 } } },
  ]);
});

test("events roll only when eligible and preserve a running event", () => {
  expect(rollEvent(stateWith({}), 0, 0).event).toEqual({ id: "rain", secondsLeft: 60 });
  expect(rollEvent(stateWith({}), 0, 1.5 / events.length).event).toEqual({ id: "haste", secondsLeft: 30 });
  expect(rollEvent(stateWith({}), 0, 2.5 / events.length).event).toEqual({ id: "treasureChest", secondsLeft: 30 });
  expect(rollEvent(stateWith({}), 0.006, 0).event).toBeNull();
  expect(rollEvent(stateWith({ event: { id: "rain", secondsLeft: 10 } }), 0, 0.9).event).toEqual({ id: "rain", secondsLeft: 10 });
});

test("chests grant production or fallback wood and actions end events", () => {
  expect(resolveEvent(stateWith({ owned: { woodenAxe: 2, quarry: 1 }, event: { id: "treasureChest", secondsLeft: 30 } }))).toMatchObject({ amounts: { wood: 120, stone: 120 }, event: null });
  expect(resolveEvent(stateWith({ event: { id: "treasureChest", secondsLeft: 30 } }))).toMatchObject({ amounts: { wood: 50 }, event: null });
  expect(resolveEvent(stateWith({ amounts: { stone: 105 }, event: { id: "creeper", secondsLeft: 5 } }))).toMatchObject({ amounts: { stone: 105 }, event: null });
});

test("Creeper expiry removes a tenth of listed resources", () => {
  expect(tick(stateWith({ amounts: { stone: 105, dirt: 10 }, event: { id: "creeper", secondsLeft: 1 } })).amounts).toEqual({ stone: 95, dirt: 9 });
});

test("trader exchanges wood for iron only when affordable", () => {
  expect(resolveEvent(stateWith({ amounts: { wood: 500 }, event: { id: "wanderingTrader", secondsLeft: 60 } })).amounts).toEqual({ wood: 0, ironIngot: 20 });
  const state = stateWith({ amounts: { wood: 499 }, event: { id: "wanderingTrader", secondsLeft: 60 } });
  expect(resolveEvent(state)).toBe(state);
});

test("Rain multiplies production and expires after its final second", () => {
  expect(tick(stateWith({ owned: { woodenAxe: 1 }, event: { id: "rain", secondsLeft: 60 } }))).toMatchObject({ amounts: { wood: 2 }, event: { id: "rain", secondsLeft: 59 } });
  expect(tick(stateWith({ event: { id: "rain", secondsLeft: 1 } })).event).toBeNull();
});

test("Haste triples mine output and offline catch-up does not start events", () => {
  expect(mine(stateWith({ event: { id: "haste", secondsLeft: 30 } }), "wood").amounts).toEqual({ wood: 3 });
  expect(catchUp(stateWith({ owned: { woodenAxe: 1 } }), 600000).event).toBeNull();
});
