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
import { perks } from "./perks.ts";
import type { PerkId } from "./perks.ts";
import { enderDragon, golemDamage } from "./dragon.ts";

export type PurchaseId = UpgradeId | ToolId | ZoneId;
export type GameState = {
  readonly amounts: Amounts;
  readonly dragonHealth: number;
  readonly owned: Partial<Record<PurchaseId, number>>;
  readonly paused: readonly UpgradeId[];
  readonly stats: { readonly clicks: number; readonly ticks: number; readonly gathered: Amounts };
  readonly lifetime: { readonly clicks: number; readonly ticks: number; readonly gathered: number; readonly records: Partial<Record<ZoneId, number>> };
  readonly event: { readonly id: EventId; readonly secondsLeft: number } | null;
  readonly achievements: readonly AchievementId[];
  readonly prestige: { readonly emeralds: number; readonly worlds: number; readonly perks: readonly PerkId[] };
};

export const tickMs = 1000;
export const maxOfflineMs = 8 * 60 * 60 * 1000;
export const initialState: GameState = { amounts: {}, dragonHealth: enderDragon.health, owned: {}, paused: [], stats: { clicks: 0, ticks: 0, gathered: {} }, lifetime: { clicks: 0, ticks: 0, gathered: 0, records: {} }, event: null, achievements: [], prestige: { emeralds: 0, worlds: 0, perks: [] } };

export function buyPerk(state: GameState, id: PerkId): GameState {
  const perk = perks.find((candidate) => candidate.id === id);
  if (perk === undefined || state.prestige.perks.includes(id) || state.prestige.emeralds < perk.cost) return state;
  return { ...state, prestige: { ...state.prestige, emeralds: state.prestige.emeralds - perk.cost, perks: [...state.prestige.perks, id] } };
}

export function emeraldsForNewWorld(state: GameState): number {
  const total = resources.reduce((sum, resource) => sum + (state.stats.gathered[resource.id] ?? 0), 0);
  return Math.floor(Math.sqrt(total / 1000)) + (state.dragonHealth === 0 ? 10 : 0);
}

export function attack(state: GameState): GameState {
  if (!zoneReached(state, "end") || state.dragonHealth <= 0) return state;
  return earnAchievements({ ...state, dragonHealth: Math.max(0, state.dragonHealth - enderDragon.clickDamage * clickPower(state)), stats: { ...state.stats, clicks: state.stats.clicks + 1 } });
}

export function canStartNewWorld(state: GameState): boolean { return emeraldsForNewWorld(state) >= 10; }

export function startNewWorld(state: GameState): GameState {
  if (!canStartNewWorld(state)) return state;
  const owned = perks.filter((perk) => state.prestige.perks.includes(perk.id) && perk.effect.kind === "startWith").reduce<Partial<Record<PurchaseId, number>>>((counts, perk) => perk.effect.kind === "startWith" ? { ...counts, ...Object.fromEntries(Object.entries(perk.effect.owned).map(([id, count]) => [id, (counts[id as PurchaseId] ?? 0) + (count ?? 0)])) } : counts, {});
  return { ...initialState, owned, achievements: state.achievements, lifetime: { clicks: state.lifetime.clicks + state.stats.clicks, ticks: state.lifetime.ticks + state.stats.ticks, gathered: state.lifetime.gathered + resources.reduce((sum, resource) => sum + (state.stats.gathered[resource.id] ?? 0), 0), records: state.lifetime.records }, prestige: { emeralds: state.prestige.emeralds + emeraldsForNewWorld(state), worlds: state.prestige.worlds + 1, perks: state.prestige.perks } };
}

export function togglePause(state: GameState, id: UpgradeId): GameState {
  return { ...state, paused: state.paused.includes(id) ? state.paused.filter((pausedId) => pausedId !== id) : [...state.paused, id] };
}

export function meets(state: GameState, condition: Condition): boolean {
  switch (condition.kind) {
    case "gathered": return (state.stats.gathered[condition.resource] ?? 0) >= condition.atLeast;
    case "gatheredTotal": return resources.reduce((sum, resource) => sum + (state.stats.gathered[resource.id] ?? 0), 0) >= condition.atLeast;
    case "owned": return ownedCount(state, condition.id) >= condition.atLeast;
    case "machines": return upgrades.reduce((sum, upgrade) => sum + ownedCount(state, upgrade.id), 0) >= condition.atLeast;
    case "clicks": return state.stats.clicks >= condition.atLeast;
    case "worlds": return state.prestige.worlds >= condition.atLeast;
    case "emeralds": return state.prestige.emeralds >= condition.atLeast;
    case "dragonDefeated": return state.dragonHealth === 0;
    case "perks": return state.prestige.perks.length >= condition.atLeast;
    default: return assertNever(condition);
  }
}

export function earnAchievements(state: GameState): GameState {
  const earned = new Set(state.achievements);
  const newlyEarned = achievements.filter((achievement) => !earned.has(achievement.id) && meets(state, achievement.when)).map((achievement) => achievement.id);
  return newlyEarned.length === 0 ? state : { ...state, achievements: [...state.achievements, ...newlyEarned] };
}

export function rollEvent(state: GameState, chance: number, pick: number): GameState {
  const factor = ownedPerkEffects(state, "eventChance").reduce((total, effect) => total * effect.factor, 1);
  if (state.event !== null || chance >= eventChance * factor) return state;
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

function ownedPerkEffects<Kind extends "offlineHours" | "eventChance" | "clickPower">(state: GameState, kind: Kind): Extract<(typeof perks)[number]["effect"], { readonly kind: Kind }>[] {
  return perks.filter((perk) => state.prestige.perks.includes(perk.id) && perk.effect.kind === kind).map((perk) => perk.effect as Extract<(typeof perks)[number]["effect"], { readonly kind: Kind }>);
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
  const perkFactor = ownedPerkEffects(state, "clickPower").reduce((total, effect) => total * effect.factor, 1);
  return (event?.effect.kind === "clickPower" ? power * event.effect.factor : power) * perkFactor * (1 + 0.1 * state.prestige.emeralds);
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
  const zone = zones.find((candidate) => candidate.id === id);
  const records = zone !== undefined && (state.lifetime.records[zone.id] === undefined || state.stats.ticks < state.lifetime.records[zone.id]!)
    ? { ...state.lifetime.records, [zone.id]: state.stats.ticks }
    : state.lifetime.records;
  return earnAchievements({ ...paid, owned: { ...paid.owned, [id]: ownedCount(paid, id) + 1 }, lifetime: { ...state.lifetime, records } });
}

export function productionMultiplier(state: GameState, resourceId: ResourceId): number {
  const event = state.event === null ? undefined : events.find((candidate) => candidate.id === state.event?.id);
  const eventFactor = event?.effect.kind === "production" && event.effect.resource === resourceId ? event.effect.factor : 1;
  return (1 + 0.01 * state.achievements.length) * eventFactor * (1 + 0.1 * state.prestige.emeralds);
}

export function tick(state: GameState): GameState {
  return tickWithPlan(state, makeTickPlan(state));
}

type TickPlan = { producing: readonly Upgrade[]; consuming: readonly Upgrade[]; multipliers: Record<string, number> };

function makeTickPlan(state: GameState): TickPlan {
  const active = (upgrade: Upgrade) => state.paused.length === 0 || !state.paused.includes(upgrade.id as UpgradeId);
  return {
    producing: upgrades.filter((upgrade) => upgrade.uses === undefined && active(upgrade)),
    consuming: upgrades.filter((upgrade) => upgrade.uses !== undefined && active(upgrade)),
    multipliers: Object.fromEntries(resources.map(resource => [resource.id, productionMultiplier(state, resource.id)])),
  };
}

function tickWithPlan(state: GameState, plan: TickPlan, checkAchievements = true): GameState {
  const { producing: activeProducing, consuming: activeConsuming, multipliers } = plan;
  const amounts: Record<string, number> = { ...state.amounts };
  const output: Record<string, number> = {};
  const gathered: Record<string, number> = { ...state.stats.gathered };
  for (const upgrade of activeProducing) {
    const count = ownedCount(state, upgrade.id as UpgradeId);
    for (const resource of resources) {
      const perTick = (upgrade.perTick as Amounts)[resource.id];
      if (perTick === undefined) continue;
      const amount = perTick * (multipliers[resource.id] ?? 1) * count;
      if (amount !== 0) amounts[resource.id] = (amounts[resource.id] ?? 0) + amount;
      if (count !== 0) output[resource.id] = (output[resource.id] ?? 0) + perTick * (multipliers[resource.id] ?? 1) * count;
    }
  }
  const consumedOutput: Amounts = {};
  for (const upgrade of activeConsuming) {
    const uses: Amounts = upgrade.uses ?? {};
    const runs = Math.min(ownedCount(state, upgrade.id as UpgradeId), ...resources.flatMap(resource => {
      const needed = uses[resource.id];
      return needed === undefined ? [] : [Math.floor((amounts[resource.id] ?? 0) / needed)];
    }));
    if (runs <= 0) continue;
    for (const resource of resources) {
      const needed = uses[resource.id];
      if (needed !== undefined) amounts[resource.id] = (amounts[resource.id] ?? 0) - needed * runs;
    }
    for (const resource of resources) {
      const perTick = (upgrade.perTick as Amounts)[resource.id];
      if (perTick === undefined) continue;
      const amount = perTick * (multipliers[resource.id] ?? 1) * runs;
      if (amount !== 0) amounts[resource.id] = (amounts[resource.id] ?? 0) + amount;
      consumedOutput[resource.id] = (consumedOutput[resource.id] ?? 0) + perTick * (multipliers[resource.id] ?? 1) * runs;
    }
  }
  const result: GameState = { ...state, amounts };
  const secondsLeft = state.event === null ? 0 : state.event.secondsLeft - 1;
  const activeEvent = state.event;
  const definition = secondsLeft <= 0 && activeEvent !== null ? events.find((candidate) => candidate.id === activeEvent.id) : undefined;
  let finalAmounts = amounts;
  if (secondsLeft <= 0 && definition?.effect.kind === "creeper") {
    const share = definition.effect.share;
    const affectedResources = definition.effect.resources;
    finalAmounts = { ...amounts };
    for (const resource of affectedResources) finalAmounts[resource] = (finalAmounts[resource] ?? 0) - Math.floor((amounts[resource] ?? 0) * share);
  }
  for (const resource of resources) {
    const gained = (output[resource.id] ?? 0) + (consumedOutput[resource.id] ?? 0);
    if (gained !== 0) gathered[resource.id] = (gathered[resource.id] ?? 0) + gained;
  }
  const dragonHealth = zoneReached(state, "end") && state.dragonHealth > 0 ? Math.max(0, state.dragonHealth - ownedCount(state, "ironGolem") * golemDamage * (1 + 0.1 * state.prestige.emeralds)) : state.dragonHealth;
  const next = { ...result, dragonHealth, amounts: finalAmounts, event: secondsLeft > 0 && state.event !== null ? { ...state.event, secondsLeft } : null, stats: { ...state.stats, ticks: state.stats.ticks + 1, gathered } };
  return !checkAchievements || state.achievements.length === achievements.length ? next : earnAchievements(next);
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
  const hours = ownedPerkEffects(state, "offlineHours").reduce((maximum, effect) => Math.max(maximum, effect.hours), 8);
  const seconds = Math.floor(Math.min(Math.max(elapsedMs, 0), hours * 60 * 60 * 1000) / tickMs);
  let next = state;
  let plan = makeTickPlan(next);
  let plannedEvent = next.event?.id ?? null;
  let plannedAchievements = next.achievements;
  for (let second = 0; second < seconds; second += 1) {
    const gatheredBefore = next.stats.gathered;
    next = tickWithPlan(next, plan, false);
    if (second === 0 || (next.achievements.length < achievements.length && gatheredAchievementThresholdCrossed(gatheredBefore, next.stats.gathered))) next = earnAchievements(next);
    const event = next.event?.id ?? null;
    if (event !== plannedEvent || next.achievements !== plannedAchievements) {
      plan = makeTickPlan(next);
      plannedEvent = event;
      plannedAchievements = next.achievements;
    }
  }
  return next;
}

function gatheredAchievementThresholdCrossed(before: Amounts, after: Amounts): boolean {
  return achievements.some((achievement) => {
    if (achievement.when.kind === "gathered") {
      return (before[achievement.when.resource] ?? 0) < achievement.when.atLeast && (after[achievement.when.resource] ?? 0) >= achievement.when.atLeast;
    }
    if (achievement.when.kind === "gatheredTotal") {
      const beforeTotal = resources.reduce((sum, resource) => sum + (before[resource.id] ?? 0), 0);
      const afterTotal = resources.reduce((sum, resource) => sum + (after[resource.id] ?? 0), 0);
      return beforeTotal < achievement.when.atLeast && afterTotal >= achievement.when.atLeast;
    }
    return false;
  });
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

function assertNever(value: never): never { throw new Error(`Unknown achievement condition: ${JSON.stringify(value)}`); }
