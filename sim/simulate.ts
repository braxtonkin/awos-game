import { buy, canBuy, initialState, mine, ownedCount, tick } from "../src/game.ts";
import type { GameState } from "../src/game.ts";
import { resources } from "../src/resources.ts";
import type { Amounts } from "../src/resources.ts";
import { upgrades } from "../src/upgrades.ts";
import type { UpgradeId } from "../src/upgrades.ts";

export type Goal = { readonly order: number; readonly own: UpgradeId; readonly count: number };
export type Report = {
  readonly reached: readonly { readonly label: string; readonly tick: number }[];
  readonly unmet: readonly string[];
  readonly state: GameState;
};

export function simulate(options: { ticks: number; clicksPerTick: number; script: readonly Goal[]; start?: GameState }): Report {
  const goals = [...options.script].sort((a, b) => a.order - b.order);
  const reached: { label: string; tick: number }[] = [];
  const recorded = new Set<string>();
  let state = options.start ?? initialState;
  for (let currentTick = 1; currentTick <= options.ticks; currentTick += 1) {
    let budget = options.clicksPerTick;
    while (true) {
      const goal = goals.find((candidate) => ownedCount(state, candidate.own) < candidate.count);
      if (goal === undefined) break;
      const label = `${goal.own}:${goal.count}`;
      if (canBuy(state, goal.own)) {
        state = buy(state, goal.own);
        if (ownedCount(state, goal.own) >= goal.count && !recorded.has(label)) {
          reached.push({ label, tick: currentTick });
          recorded.add(label);
        }
        continue;
      }
      if (budget <= 0) break;
      const upgrade = upgrades.find((candidate) => candidate.id === goal.own);
      const cost: Amounts = upgrade?.cost ?? {};
      const lacking = resources
        .filter((resource) => resource.perClick > 0)
        .map((resource) => ({ resource, shortfall: Math.max(0, (cost[resource.id] ?? 0) - (state.amounts[resource.id] ?? 0)) }))
        .filter(({ shortfall }) => shortfall > 0)
        .sort((a, b) => b.shortfall - a.shortfall);
      if (lacking.length === 0) break;
      state = mine(state, lacking[0]!.resource.id);
      budget -= 1;
    }
    state = tick(state);
  }
  const unmet = goals.filter((goal) => ownedCount(state, goal.own) < goal.count).map((goal) => `${goal.own}:${goal.count}`);
  return { reached, unmet, state };
}
