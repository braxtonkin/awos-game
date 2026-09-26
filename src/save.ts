import { initialState } from "./game.ts";
import type { GameState } from "./game.ts";
import { resources } from "./resources.ts";
import { upgrades } from "./upgrades.ts";

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function deserialize(text: string | null): GameState {
  if (text === null) {
    return initialState;
  }
  let saved: unknown;
  try {
    saved = JSON.parse(text);
  } catch {
    return initialState;
  }
  if (!isRecord(saved)) {
    return initialState;
  }
  return {
    amounts: keepCounts(saved.amounts, resources.map((resource) => resource.id)),
    owned: keepCounts(saved.owned, upgrades.map((upgrade) => upgrade.id)),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function keepCounts<Id extends string>(
  value: unknown,
  ids: readonly Id[],
): Partial<Record<Id, number>> {
  if (!isRecord(value)) {
    return {};
  }
  return ids.reduce<Partial<Record<Id, number>>>((counts, id) => {
    const count = value[id];
    if (typeof count !== "number" || !Number.isFinite(count) || count < 0) {
      return counts;
    }
    return { ...counts, [id]: count };
  }, {});
}
