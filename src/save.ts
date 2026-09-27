import { initialState } from "./game.ts";
import type { GameState } from "./game.ts";
import { resources } from "./resources.ts";
import { upgrades } from "./upgrades.ts";
import { tools } from "./tools.ts";
import { zones } from "./zones.ts";

export type LoadedSave = { readonly state: GameState; readonly savedAt: number | null };

export function serialize(state: GameState, savedAt?: number): string {
  return JSON.stringify(savedAt === undefined ? state : { state, savedAt });
}

export function deserialize(text: string | null): GameState {
  return loadSave(text).state;
}

export function loadSave(text: string | null): LoadedSave {
  if (text === null) {
    return { state: initialState, savedAt: null };
  }
  let saved: unknown;
  try {
    saved = JSON.parse(text);
  } catch {
    return { state: initialState, savedAt: null };
  }
  if (!isRecord(saved)) {
    return { state: initialState, savedAt: null };
  }
  const wrapped = isRecord(saved.state);
  const data = wrapped ? saved.state as Record<string, unknown> : saved;
  const savedAt = wrapped && typeof saved.savedAt === "number" && Number.isFinite(saved.savedAt)
    ? saved.savedAt
    : null;
  return {
    state: {
      amounts: keepCounts(data.amounts, resources.map((resource) => resource.id)),
      owned: keepCounts(data.owned, [...upgrades, ...tools, ...zones].map((purchase) => purchase.id)),
    },
    savedAt,
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
