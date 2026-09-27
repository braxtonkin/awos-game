import { expect, test } from "vitest";
import { catchUp, mine, rollEvent, tick } from "../src/game.ts";
import { events, eventChance } from "../src/events.ts";
import { stateWith } from "./state.ts";

test("event catalog defines Rain and Haste", () => {
  expect(eventChance).toBe(1 / 180);
  expect(events).toEqual([
    { id: "rain", name: "Rain", text: "Rain soaks the forest. Wood production is doubled.", seconds: 60, effect: { kind: "production", resource: "wood", factor: 2 } },
    { id: "haste", name: "Haste", text: "Haste! Every click mines three times as much.", seconds: 30, effect: { kind: "clickPower", factor: 3 } },
  ]);
});

test("events roll only when eligible and preserve a running event", () => {
  expect(rollEvent(stateWith({}), 0, 0).event).toEqual({ id: "rain", secondsLeft: 60 });
  expect(rollEvent(stateWith({}), 0, 1.5 / events.length).event).toEqual({ id: "haste", secondsLeft: 30 });
  expect(rollEvent(stateWith({}), 0.006, 0).event).toBeNull();
  expect(rollEvent(stateWith({ event: { id: "rain", secondsLeft: 10 } }), 0, 0.9).event).toEqual({ id: "rain", secondsLeft: 10 });
});

test("Rain multiplies production and expires after its final second", () => {
  expect(tick(stateWith({ owned: { woodenAxe: 1 }, event: { id: "rain", secondsLeft: 60 } }))).toMatchObject({ amounts: { wood: 2 }, event: { id: "rain", secondsLeft: 59 } });
  expect(tick(stateWith({ event: { id: "rain", secondsLeft: 1 } })).event).toBeNull();
});

test("Haste triples mine output and offline catch-up does not start events", () => {
  expect(mine(stateWith({ event: { id: "haste", secondsLeft: 30 } }), "wood").amounts).toEqual({ wood: 3 });
  expect(catchUp(stateWith({ owned: { woodenAxe: 1 } }), 600000).event).toBeNull();
});
