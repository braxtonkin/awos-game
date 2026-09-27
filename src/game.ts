import { resources } from "./resources.ts";
import type { Amounts, ResourceId } from "./resources.ts";
import { upgrades } from "./upgrades.ts";
import type { Upgrade, UpgradeId } from "./upgrades.ts";
import { tools } from "./tools.ts";
import type { ToolId } from "./tools.ts";
import { zones } from "./zones.ts";
import type { ZoneId } from "./zones.ts";
import { recipes } from "./recipes.ts";
import type { RecipeId } from "./recipes.ts";
import { events, eventChance } from "./events.ts";
import { achievements } from "./achievements.ts";
import type { AchievementId, Condition } from "./achievements.ts";
import type { EventId } from "./events.ts";

export type PurchaseId = UpgradeId | ToolId | ZoneId;
export type GameState = {
  readonly amounts: Amounts;
  readonly owned: Partial<Record<PurchaseId, number>>;
  readonly stats: { readonly clicks: number; readonly ticks: number; readonly gathered: Amounts };
  readonly event: { readonly id: EventId; readonly secondsLeft: number } | null;
  readonly achievements: readonly AchievementId[];
};

export const tickMs = 1000;
export const maxOfflineMs = 8 * 60 * 60 * 1000;
export const initialState: GameState = { amounts: {}, owned: {}, stats: { clicks: 0, ticks: 0, gathered: {} }, event: null, achievements: [] };

export function meets(state: GameState, condition: Condition): boolean {
  switch (condition.kind) {
    case "gathered": return (state.stats.gathered[condition.resource] ?? 0) >= condition.atLeast;
    case "gatheredTotal": return resources.reduce((sum, resource) => sum + (state.stats.gathered[resource.id] ?? 0), 0) >= condition.atLeast;
    case "owned": return ownedCount(state, condition.id) >= condition.atLeast;
    case "machines": return upgrades.reduce((sum, upgrade) => sum + ownedCount(state, upgrade.id), 0) >= condition.atLeast;
    case "clicks": return state.stats.clicks >= condition.atLeast;
    default: return assertNever(condition);
  }
}

export function earnAchievements(state: GameState): GameState {
  const earned = new Set(state.achievements);
  const newlyEarned = achievements.filter((achievement) => !earned.has(achievement.id) && meets(state, achievement.when)).map((achievement) => achievement.id);
  return newlyEarned.length === 0 ? state : { ...state, achievements: [...state.achievements, ...newlyEarned] };
}

export function rollEvent(state: GameState, chance: number, pick: number): GameState {
  if (state.event !== null || chance >= eventChance) return state;
  const event = events[Math.floor(pick * events.length)];
  if (event === undefined) return state;
  return { ...state, event: { id: event.id, secondsLeft: event.seconds } };
}

export function resolveEvent(state: GameState): GameState {
  if (state.event === null) return state;
  const definition = events.find((candidate) => candidate.id === state.event?.id);
  if (definition === undefined) return state;
  switch (definition.effect.kind) {
    case "chest": {
      const seconds = definition.effect.seconds;
      const output = upgrades.filter((upgrade) => upgrade.uses === undefined).reduce<Amounts>((totals, upgrade) => {
        const byResource = resources.reduce<Amounts>((amounts, resource) => {
          const amount = (upgrade.perTick as Amounts)[resource.id];
          return amount === undefined ? amounts : { ...amounts, [resource.id]: amount * ownedCount(state, upgrade.id) * productionMultiplier(state, resource.id) * seconds };
        }, {});
        return mergeAmounts(totals, byResource);
      }, {});
      return { ...addAmounts(state, Object.keys(output).length === 0 ? { wood: 50 } : output, 1), event: null };
    }
    case "creeper": return { ...state, event: null };
    case "trade": return affords(state, definition.effect.give) ? { ...addAmounts(addAmounts(state, definition.effect.give, -1), definition.effect.get, 1), event: null } : state;
    case "production":
    case "clickPower": return state;
    default: return assertNever(definition.effect);
  }
}

export function amountOf(state: GameState, resourceId: ResourceId): number {
  return state.amounts[resourceId] ?? 0;
}

export function canAffordEvent(state: GameState, cost: Amounts): boolean { return affords(state, cost); }

export function ownedCount(state: GameState, upgradeId: PurchaseId): number {
  return state.owned[upgradeId] ?? 0;
}

export function costOf(state: GameState, id: PurchaseId): Amounts {
  const entry = [...upgrades, ...tools, ...zones].find((purchase) => purchase.id === id);
  if (entry === undefined) return {};
  if (!upgrades.some((upgrade) => upgrade.id === id)) return entry.cost;
  const multiplier = 1.15 ** ownedCount(state, id);
  return resources.reduce<Amounts>((cost, resource) => {
    const base = (entry.cost as Amounts)[resource.id];
    return base === undefined ? cost : { ...cost, [resource.id]: Math.ceil(base * multiplier) };
  }, {});
}

export function costOfMany(state: GameState, id: UpgradeId, count: number): Amounts {
  let total: Amounts = {};
  for (let index = 0; index < count; index += 1) {
    const atCount = { ...state, owned: { ...state.owned, [id]: ownedCount(state, id) + index } };
    total = mergeAmounts(total, costOf(atCount, id));
  }
  return total;
}

export function maxAffordable(state: GameState, id: UpgradeId): number {
  let count = 0;
  while (affords(state, costOfMany(state, id, count + 1))) count += 1;
  return count;
}

export function buyMany(state: GameState, id: UpgradeId, count: number): GameState {
  const cost = costOfMany(state, id, count);
  if (!affords(state, cost)) return state;
  const paid = addAmounts(state, cost, -1);
  return { ...paid, owned: { ...paid.owned, [id]: ownedCount(paid, id) + count } };
}

export function zoneReached(state: GameState, zoneId: ZoneId): boolean {
  return zones[0]?.id === zoneId || ownedCount(state, zoneId) === 1;
}

export function canMine(state: GameState, resourceId: ResourceId): boolean {
  const resource = resources.find((candidate) => candidate.id === resourceId);
  return resource !== undefined && resource.perClick > 0 && zones.some(
    (zone) => zoneReached(state, zone.id) && (zone.resources as readonly ResourceId[]).includes(resourceId),
  );
}

export function isDiscovered(state: GameState, resourceId: ResourceId): boolean {
  return canMine(state, resourceId) || amountOf(state, resourceId) > 0 || (state.stats.gathered[resourceId] ?? 0) > 0;
}

export function clickPower(state: GameState): number {
  const power = tools.reduce((best, tool) => ownedCount(state, tool.id) > 0 ? Math.max(best, tool.clickPower) : best, 1);
  const event = state.event === null ? undefined : events.find((candidate) => candidate.id === state.event?.id);
  return event?.effect.kind === "clickPower" ? power * event.effect.factor : power;
}

export function mine(state: GameState, resourceId: ResourceId): GameState {
  if (!canMine(state, resourceId)) return earnAchievements(state);
  const resource = resources.find((candidate) => candidate.id === resourceId);
  if (resource === undefined) return earnAchievements(state);
  const mined = { [resource.id]: resource.perClick * clickPower(state) };
  const next = addAmounts(state, mined, 1);
  return earnAchievements({ ...next, stats: { ...state.stats, clicks: state.stats.clicks + 1, gathered: mergeAmounts(state.stats.gathered, mined) } });
}

export function canBuy(state: GameState, id: PurchaseId): boolean {
  const item = [...upgrades, ...tools, ...zones].find((purchase) => purchase.id === id);
  if (item === undefined) return false;
  const oneTime = tools.some((tool) => tool.id === id) || zones.some((zone) => zone.id === id);
  if (oneTime && ownedCount(state, id) > 0) return false;
  const zone = zones.find((candidate) => candidate.id === id);
  if (zone?.requires !== null && zone?.requires !== undefined && ownedCount(state, zone.requires) < 1) return false;
  return affords(state, costOf(state, id));
}

export function buy(state: GameState, id: PurchaseId): GameState {
  if (!canBuy(state, id)) return earnAchievements(state);
  const paid = addAmounts(state, costOf(state, id), -1);
  return earnAchievements({ ...paid, owned: { ...paid.owned, [id]: ownedCount(paid, id) + 1 } });
}

export function productionMultiplier(state: GameState, resourceId: ResourceId): number {
  const event = state.event === null ? undefined : events.find((candidate) => candidate.id === state.event?.id);
  const eventFactor = event?.effect.kind === "production" && event.effect.resource === resourceId ? event.effect.factor : 1;
  return (1 + 0.01 * state.achievements.length) * eventFactor;
}

export function tick(state: GameState): GameState {
  const producing = upgrades.filter((upgrade: Upgrade) => upgrade.uses === undefined);
  const consuming = upgrades.filter((upgrade: Upgrade) => upgrade.uses !== undefined);
  const output = producing.reduce<Amounts>((totals, upgrade) => {
    const multiplied = resources.reduce<Amounts>((amounts, resource) => {
      const count = (upgrade.perTick as Amounts)[resource.id];
      if (count === undefined) return amounts;
      return { ...amounts, [resource.id]: count * productionMultiplier(state, resource.id) };
    }, {});
    return mergeAmounts(totals, scaleAmounts(multiplied, ownedCount(state, upgrade.id)));
  }, {});
  const produced = addAmounts(state, output, 1);
  const consumedOutput: Amounts = {};
  const result = consuming.reduce((next, upgrade) => {
    let result = next;
    const uses: Amounts = upgrade.uses ?? {};
    for (let count = 0; count < ownedCount(state, upgrade.id); count += 1) {
      const canUse = resources.every((resource) => {
        const needed = uses[resource.id];
        return needed === undefined || amountOf(result, resource.id) >= needed;
      });
      if (canUse) {
        const multiplied = resources.reduce<Amounts>((amounts, resource) => {
          const value = (upgrade.perTick as Amounts)[resource.id];
          return value === undefined ? amounts : { ...amounts, [resource.id]: value * productionMultiplier(state, resource.id) };
        }, {});
        result = addAmounts(addAmounts(result, uses, -1), multiplied, 1);
        Object.assign(consumedOutput, mergeAmounts(consumedOutput, multiplied));
      }
    }
    return result;
  }, produced);
  const secondsLeft = state.event === null ? 0 : state.event.secondsLeft - 1;
  const activeEvent = state.event;
  const definition = secondsLeft <= 0 && activeEvent !== null ? events.find((candidate) => candidate.id === activeEvent.id) : undefined;
  let finalResult = result;
  if (secondsLeft <= 0 && definition?.effect.kind === "creeper") {
    const share = definition.effect.share;
    const affectedResources = definition.effect.resources;
    const loss = affectedResources.reduce<Amounts>((amounts, resource) => ({ ...amounts, [resource]: Math.floor(amountOf(result, resource) * share) }), {});
    finalResult = addAmounts(result, loss, -1);
  }
  return earnAchievements({ ...finalResult, event: secondsLeft > 0 && state.event !== null ? { ...state.event, secondsLeft } : null, stats: { ...state.stats, ticks: state.stats.ticks + 1, gathered: mergeAmounts(state.stats.gathered, mergeAmounts(output, consumedOutput)) } });
}

export function canCraft(state: GameState, recipeId: RecipeId): boolean {
  const recipe = recipes.find((candidate) => candidate.id === recipeId);
  return recipe !== undefined && affords(state, recipe.inputs);
}

export function craft(state: GameState, recipeId: RecipeId): GameState {
  const recipe = recipes.find((candidate) => candidate.id === recipeId);
  if (recipe === undefined || !canCraft(state, recipeId)) return earnAchievements(state);
  const next = addAmounts(addAmounts(state, recipe.inputs, -1), recipe.outputs, 1);
  return earnAchievements({ ...next, stats: { ...state.stats, clicks: state.stats.clicks + 1, gathered: mergeAmounts(state.stats.gathered, recipe.outputs) } });
}

export function catchUp(state: GameState, elapsedMs: number): GameState {
  const seconds = Math.floor(Math.min(Math.max(elapsedMs, 0), maxOfflineMs) / tickMs);
  let next = state;
  for (let second = 0; second < seconds; second += 1) next = tick(next);
  return next;
}

function affords(state: GameState, cost: Amounts): boolean {
  return resources.every((resource) => {
    const needed = cost[resource.id];
    return needed === undefined || amountOf(state, resource.id) >= needed;
  });
}

function addAmounts(state: GameState, amounts: Amounts, factor: number): GameState {
  if (factor === 0) return state;
  return {
    ...state,
    amounts: resources.reduce<Amounts>((totals, resource) => {
      const change = amounts[resource.id];
      if (change === undefined) return totals;
      return { ...totals, [resource.id]: amountOf(state, resource.id) + change * factor };
    }, state.amounts),
  };
}

function mergeAmounts(left: Amounts, right: Amounts): Amounts {
  return resources.reduce<Amounts>((result, resource) => {
    const amount = (left[resource.id] ?? 0) + (right[resource.id] ?? 0);
    return amount === 0 ? result : { ...result, [resource.id]: amount };
  }, {});
}

function scaleAmounts(amounts: Amounts, factor: number): Amounts {
  return resources.reduce<Amounts>((result, resource) => {
    const amount = amounts[resource.id];
    return amount === undefined || factor === 0 ? result : { ...result, [resource.id]: amount * factor };
  }, {});
}

function assertNever(value: never): never { throw new Error(`Unknown achievement condition: ${JSON.stringify(value)}`); }
