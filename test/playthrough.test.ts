import { describe, expect, it } from "vitest";
import { bounds } from "../sim/bounds.ts";
import { script } from "../sim/script.ts";
import { simulate } from "../sim/simulate.ts";

describe("scripted playthrough", () => {
  it("reaches an axe at the expected ticks", () => {
    const goal = [{ order: 10, own: "woodenAxe" as const, count: 1 }];
    expect(simulate({ ticks: 20, clicksPerTick: 2, script: goal }).reached).toEqual([{ label: "woodenAxe:1", tick: 8 }]);
    expect(simulate({ ticks: 20, clicksPerTick: 1, script: goal }).reached).toEqual([{ label: "woodenAxe:1", tick: 15 }]);
  });

  it("reaches every canonical goal within 18000 ticks", () => {
    expect(simulate({ ticks: 18000, clicksPerTick: 2, script }).unmet).toEqual([]);
  });

  it("meets all bounds and each bound names a scripted goal", () => {
    const report = simulate({ ticks: 18000, clicksPerTick: 2, script });
    for (const [label, bound] of Object.entries(bounds)) {
      const item = report.reached.find((goal) => goal.label === label);
      expect(item?.tick).toBeLessThanOrEqual(bound);
      expect(script.some((goal) => `${goal.own}:${goal.count}` === label)).toBe(true);
    }
  });
});
