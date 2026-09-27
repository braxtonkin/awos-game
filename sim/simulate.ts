import { buy, canBuy, canMine, canStartNewWorld, costOf, craft, initialState, mine, ownedCount, startNewWorld, tick } from "../src/game.ts";
import type { GameState, PurchaseId } from "../src/game.ts";
import { resources } from "../src/resources.ts";
import type { Amounts, ResourceId } from "../src/resources.ts";
import { recipes, type Recipe } from "../src/recipes.ts";

export type Goal = { readonly order: number; readonly own: PurchaseId; readonly count: number } | { readonly order: number; readonly newWorld: true };
export type Report = {
  readonly reached: readonly { readonly label: string; readonly tick: number; readonly world?: number }[];
  readonly unmet: readonly string[];
  readonly state: GameState;
};

export function simulate(options: { ticks: number; clicksPerTick: number; script: readonly Goal[]; start?: GameState }): Report {
  const goals = [...options.script].sort((a, b) => a.order - b.order);
  const reached: { label: string; tick: number; world?: number }[] = [];
  const recorded = new Set<string>();
  const usedWorldGoals = new Set<number>();
  let state = options.start ?? initialState;
  for (let currentTick = 1; currentTick <= options.ticks; currentTick += 1) {
    let budget = options.clicksPerTick;
    while (true) {
      const goal = goals.find((candidate) => "newWorld" in candidate ? !usedWorldGoals.has(candidate.order) : ownedCount(state, candidate.own) < candidate.count);
      if (goal === undefined) break;
      if ("newWorld" in goal) {
        if (!canStartNewWorld(state)) break;
        state = startNewWorld(state);
        usedWorldGoals.add(goal.order);
        reached.push({ label: "newWorld", tick: currentTick, world: state.prestige.worlds + 1 });
        continue;
      }
      const label = `${goal.own}:${goal.count}`;
      if (canBuy(state, goal.own)) {
        state = buy(state, goal.own);
        const recordKey = `${state.prestige.worlds}:${label}`;
        if (ownedCount(state, goal.own) >= goal.count && !recorded.has(recordKey)) {
          reached.push({ label, tick: currentTick, ...(state.prestige.worlds > 0 ? { world: state.prestige.worlds + 1 } : {}) });
          recorded.add(recordKey);
        }
        continue;
      }
      if (budget <= 0) break;
      const need = plannedNeed(state, costOf(state, goal.own));
      const craftable = (recipes as readonly Recipe[]).find((recipe) => resources.some((resource) =>
        (recipe.outputs[resource.id] ?? 0) > 0 && !canMine(state, resource.id) &&
        (need[resource.id] ?? 0) > (state.amounts[resource.id] ?? 0)) &&
        resources.every((resource) => (recipe.inputs[resource.id] ?? 0) <= (state.amounts[resource.id] ?? 0)));
      if (craftable !== undefined) {
        state = craft(state, craftable.id as typeof recipes[number]["id"]);
        budget -= 1;
        continue;
      }
      const lacking = resources.map((resource, index) => ({ resource, index, shortfall: Math.max(0, (need[resource.id] ?? 0) - (state.amounts[resource.id] ?? 0)) }))
        .filter(({ resource, shortfall }) => shortfall > 0 && canMine(state, resource.id))
        .sort((a, b) => b.shortfall - a.shortfall || a.index - b.index);
      if (lacking.length === 0) break;
      state = mine(state, lacking[0]!.resource.id);
      budget -= 1;
    }
    state = tick(state);
  }
  const unmet = goals.filter((goal) => "newWorld" in goal ? !usedWorldGoals.has(goal.order) : ownedCount(state, goal.own) < goal.count).map((goal) => "newWorld" in goal ? "newWorld" : `${goal.own}:${goal.count}`);
  return { reached, unmet, state };
}

function plannedNeed(state: GameState, cost: Amounts): Amounts {
  const need: Partial<Record<ResourceId, number>> = { ...cost };
  const expanded = new Set<ResourceId>();
  while (true) {
    const catalog = recipes as readonly Recipe[];
    const short = resources.find((resource) => !expanded.has(resource.id) && !canMine(state, resource.id) &&
      (need[resource.id] ?? 0) > (state.amounts[resource.id] ?? 0) && catalog.some((recipe) => (recipe.outputs[resource.id] ?? 0) > 0));
    if (short === undefined) break;
    expanded.add(short.id);
    const recipe = catalog.find((candidate) => (candidate.outputs[short.id] ?? 0) > 0)!;
    const crafts = Math.ceil(((need[short.id] ?? 0) - (state.amounts[short.id] ?? 0)) / recipe.outputs[short.id]!);
    for (const resource of resources) need[resource.id] = (need[resource.id] ?? 0) + (recipe.inputs[resource.id] ?? 0) * crafts;
  }
  return need;
}
