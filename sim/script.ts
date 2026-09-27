import type { Goal } from "./simulate.ts";

export const script: readonly Goal[] = [
  { order: 10, own: "woodenAxe", count: 1 },
  { order: 20, own: "woodenAxe", count: 2 },
  { order: 30, own: "woodenAxe", count: 3 },
  { order: 40, own: "woodenPickaxe", count: 1 },
  { order: 60, own: "woodenAxe", count: 5 },
  { order: 80, own: "woodenPickaxe", count: 2 },
  { order: 120, own: "furnace", count: 1 },
  { order: 130, own: "woodenAxe", count: 8 },
];
