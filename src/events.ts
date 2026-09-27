import type { ResourceId } from "./resources.ts";

export type EventEffect = { kind: "production"; resource: ResourceId; factor: number } | { kind: "clickPower"; factor: number } | { kind: "chest"; seconds: number } | { kind: "creeper"; share: number; resources: readonly ResourceId[] } | { kind: "trade"; give: import("./resources.ts").Amounts; get: import("./resources.ts").Amounts };
export type GameEvent = { id: string; name: string; text: string; seconds: number; effect: EventEffect };

export const eventChance = 1 / 180;
export const events = [
  { id: "rain", name: "Rain", text: "Rain soaks the forest. Wood production is doubled.", seconds: 60, effect: { kind: "production", resource: "wood", factor: 2 } },
  { id: "haste", name: "Haste", text: "Haste! Every click mines three times as much.", seconds: 30, effect: { kind: "clickPower", factor: 3 } },
  { id: "treasureChest", name: "Treasure chest", text: "A treasure chest! Open it for a minute of production.", seconds: 30, effect: { kind: "chest", seconds: 60 } },
  { id: "creeper", name: "Creeper", text: "A Creeper is coming! Defuse it, or lose a tenth of your Stone and Dirt.", seconds: 15, effect: { kind: "creeper", share: 0.1, resources: ["stone", "dirt"] } },
  { id: "wanderingTrader", name: "Wandering trader", text: "A wandering trader offers 20 Iron ingots for 500 Wood.", seconds: 60, effect: { kind: "trade", give: { wood: 500 }, get: { ironIngot: 20 } } },
] as const satisfies readonly GameEvent[];

export type EventId = (typeof events)[number]["id"];
