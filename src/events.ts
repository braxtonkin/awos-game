import type { ResourceId } from "./resources.ts";

export type EventEffect = { kind: "production"; resource: ResourceId; factor: number } | { kind: "clickPower"; factor: number };
export type GameEvent = { id: string; name: string; text: string; seconds: number; effect: EventEffect };

export const eventChance = 1 / 180;
export const events = [
  { id: "rain", name: "Rain", text: "Rain soaks the forest. Wood production is doubled.", seconds: 60, effect: { kind: "production", resource: "wood", factor: 2 } },
  { id: "haste", name: "Haste", text: "Haste! Every click mines three times as much.", seconds: 30, effect: { kind: "clickPower", factor: 3 } },
] as const satisfies readonly GameEvent[];

export type EventId = (typeof events)[number]["id"];
