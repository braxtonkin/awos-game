import { resources } from "./resources.ts";
import type { Amounts, ResourceId } from "./resources.ts";
import { upgrades } from "./upgrades.ts";
import type { UpgradeId } from "./upgrades.ts";

export type GameState = {
  readonly amounts: Amounts;
  readonly owned: Partial<Record<UpgradeId, number>>;
};

export const tickMs = 1000;

export const initialState: GameState = { amounts: {}, owned: {} };

export function amountOf(state: GameState, resourceId: ResourceId): number {
  return state.amounts[resourceId] ?? 0;
}

export function ownedCount(state: GameState, upgradeId: UpgradeId): number {
  return state.owned[upgradeId] ?? 0;
}

export function mine(state: GameState, resourceId: ResourceId): GameState {
  const resource = resources.find((candidate) => candidate.id === resourceId);
  if (resource === undefined) {
    return state;
  }
  return addAmounts(state, { [resource.id]: resource.perClick }, 1);
}

export function canBuy(state: GameState, upgradeId: UpgradeId): boolean {
  const upgrade = upgrades.find((candidate) => candidate.id === upgradeId);
  return upgrade !== undefined && affords(state, upgrade.cost);
}

export function buy(state: GameState, upgradeId: UpgradeId): GameState {
  const upgrade = upgrades.find((candidate) => candidate.id === upgradeId);
  if (upgrade === undefined || !affords(state, upgrade.cost)) {
    return state;
  }
  const paid = addAmounts(state, upgrade.cost, -1);
  return {
    ...paid,
    owned: { ...paid.owned, [upgradeId]: ownedCount(paid, upgradeId) + 1 },
  };
}

export function tick(state: GameState): GameState {
  const produced = upgrades.reduce(
    (next, upgrade) =>
      Object.keys(upgrade.uses).length === 0
        ? addAmounts(next, upgrade.perTick, ownedCount(state, upgrade.id))
        : next,
    state,
  );
  return upgrades.reduce((next, upgrade) => {
    let consumed = next;
    const uses: Amounts = upgrade.uses;
    for (const resource of resources) {
      const perUpgrade = uses[resource.id] ?? 0;
      for (let count = 0; count < ownedCount(state, upgrade.id); count += 1) {
        if (perUpgrade === 0 || amountOf(consumed, resource.id) < perUpgrade) {
          break;
        }
        consumed = addAmounts(consumed, uses, -1);
        consumed = addAmounts(consumed, upgrade.perTick, 1);
      }
    }
    return consumed;
  }, produced);
}

function affords(state: GameState, cost: Amounts): boolean {
  return resources.every((resource) => {
    const needed = cost[resource.id];
    return needed === undefined || amountOf(state, resource.id) >= needed;
  });
}

function addAmounts(state: GameState, amounts: Amounts, factor: number): GameState {
  if (factor === 0) {
    return state;
  }
  return {
    ...state,
    amounts: resources.reduce<Amounts>((totals, resource) => {
      const change = amounts[resource.id];
      if (change === undefined) {
        return totals;
      }
      return { ...totals, [resource.id]: amountOf(state, resource.id) + change * factor };
    }, state.amounts),
  };
}
