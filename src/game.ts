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

export type PurchaseId = UpgradeId | ToolId | ZoneId;
export type GameState = {
  readonly amounts: Amounts;
  readonly owned: Partial<Record<PurchaseId, number>>;
};

export const tickMs = 1000;
export const maxOfflineMs = 8 * 60 * 60 * 1000;
export const initialState: GameState = { amounts: {}, owned: {} };

export function amountOf(state: GameState, resourceId: ResourceId): number {
  return state.amounts[resourceId] ?? 0;
}

export function ownedCount(state: GameState, upgradeId: PurchaseId): number {
  return state.owned[upgradeId] ?? 0;
}

export function costOf(_state: GameState, id: PurchaseId): Amounts {
  const entry = [...upgrades, ...tools, ...zones].find((purchase) => purchase.id === id);
  return entry?.cost ?? {};
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

export function clickPower(state: GameState): number {
  return tools.reduce((best, tool) => ownedCount(state, tool.id) > 0 ? Math.max(best, tool.clickPower) : best, 1);
}

export function mine(state: GameState, resourceId: ResourceId): GameState {
  if (!canMine(state, resourceId)) return state;
  const resource = resources.find((candidate) => candidate.id === resourceId);
  return resource === undefined ? state : addAmounts(state, { [resource.id]: resource.perClick }, clickPower(state));
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
  if (!canBuy(state, id)) return state;
  const paid = addAmounts(state, costOf(state, id), -1);
  return { ...paid, owned: { ...paid.owned, [id]: ownedCount(paid, id) + 1 } };
}

export function productionMultiplier(_state: GameState, _resourceId: ResourceId): number {
  return 1;
}

export function tick(state: GameState): GameState {
  const producing = upgrades.filter((upgrade: Upgrade) => upgrade.uses === undefined);
  const consuming = upgrades.filter((upgrade: Upgrade) => upgrade.uses !== undefined);
  const produced = producing.reduce((next, upgrade) => {
    const multiplied = resources.reduce<Amounts>((amounts, resource) => {
      const count = (upgrade.perTick as Amounts)[resource.id];
      if (count === undefined) return amounts;
      return { ...amounts, [resource.id]: count * productionMultiplier(state, resource.id) };
    }, {});
    return addAmounts(next, multiplied, ownedCount(state, upgrade.id));
  }, state);
  return consuming.reduce((next, upgrade) => {
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
      }
    }
    return result;
  }, produced);
}

export function canCraft(state: GameState, recipeId: RecipeId): boolean {
  const recipe = recipes.find((candidate) => candidate.id === recipeId);
  return recipe !== undefined && affords(state, recipe.inputs);
}

export function craft(state: GameState, recipeId: RecipeId): GameState {
  const recipe = recipes.find((candidate) => candidate.id === recipeId);
  if (recipe === undefined || !canCraft(state, recipeId)) return state;
  return addAmounts(addAmounts(state, recipe.inputs, -1), recipe.outputs, 1);
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
