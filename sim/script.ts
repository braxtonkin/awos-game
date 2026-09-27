import type { Goal } from "./simulate.ts";

export const script: readonly Goal[] = [
  { order: 10, own: "woodenAxe", count: 1 },
  { order: 20, own: "woodenAxe", count: 2 },
  { order: 30, own: "woodenAxe", count: 3 },
  { order: 40, own: "woodenPickaxe", count: 1 },
  { order: 50, own: "quarry", count: 1 },
  { order: 60, own: "woodenAxe", count: 5 },
  { order: 70, own: "quarry", count: 3 },
  { order: 80, own: "woodenPickaxe", count: 2 },
  { order: 100, own: "coalMine", count: 2 },
  { order: 110, own: "quarry", count: 5 },
  { order: 120, own: "furnace", count: 1 },
  { order: 130, own: "woodenAxe", count: 8 },
  { order: 140, own: "coalMine", count: 4 },
];
