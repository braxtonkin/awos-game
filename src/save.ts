import { initialState } from "./game.ts";
import type { GameState } from "./game.ts";
import { resources } from "./resources.ts";
import { upgrades } from "./upgrades.ts";
import type { UpgradeId } from "./upgrades.ts";
import { tools } from "./tools.ts";
import { zones } from "./zones.ts";
import { events } from "./events.ts";
import { achievements } from "./achievements.ts";
import type { AchievementId } from "./achievements.ts";
import { perks } from "./perks.ts";
import type { PerkId } from "./perks.ts";

export const currentSaveVersion = 2;

export type LoadedSave = { readonly state: GameState; readonly savedAt: number | null };
export type DecodedSave =
  | { readonly kind: "loaded"; readonly state: GameState; readonly savedAt: number | null; readonly version: number }
  | { readonly kind: "invalid"; readonly reason: string };

type SaveRecord = Record<string, unknown>;
type Migration = (save: SaveRecord) => SaveRecord;

const migrations: readonly Migration[] = [
  (save) => ({ state: save, savedAt: null }),
  (save) => ({ ...save, version: 2 }),
];

export function serialize(state: GameState, savedAt: number): string {
  return JSON.stringify({ version: currentSaveVersion, savedAt, state });
}

export function deserialize(text: string | null): GameState {
  return loadSave(text).state;
}

export function decodeSave(text: string): DecodedSave {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { kind: "invalid", reason: "The text is not valid JSON." };
  }
  if (!isRecord(parsed)) {
    return { kind: "invalid", reason: "The text is not a saved game." };
  }
  const version = typeof parsed.version === "number"
    ? parsed.version
    : isRecord(parsed.state) ? 1 : 0;
  if (version > currentSaveVersion) {
    return { kind: "invalid", reason: `Save version ${version} is newer than this game supports.` };
  }
  if (!Number.isInteger(version) || version < 0) {
    return { kind: "invalid", reason: "The text is not a saved game." };
  }
  let migrated: SaveRecord = parsed;
  for (let step = version; step < currentSaveVersion; step += 1) {
    const migration = migrations[step];
    if (migration === undefined) {
      return { kind: "invalid", reason: "The text is not a saved game." };
    }
    migrated = migration(migrated);
  }
  if (!isRecord(migrated.state)) {
    return { kind: "invalid", reason: "The text is not a saved game." };
  }
  const savedAt = typeof migrated.savedAt === "number" && Number.isFinite(migrated.savedAt)
    ? migrated.savedAt
    : null;
  return { kind: "loaded", state: parseState(migrated.state), savedAt, version };
}

export function loadSave(text: string | null): LoadedSave {
  if (text === null) {
    return { state: initialState, savedAt: null };
  }
  const decoded = decodeSave(text);
  return decoded.kind === "loaded"
    ? { state: decoded.state, savedAt: decoded.savedAt }
    : { state: initialState, savedAt: null };
}

function parseState(value: SaveRecord): GameState {
  const eventValue = isRecord(value.event) ? value.event : null;
  const eventDefinition = eventValue === null ? undefined : events.find((event) => event.id === eventValue.id);
  const event = eventDefinition !== undefined && typeof eventValue?.secondsLeft === "number" && Number.isInteger(eventValue.secondsLeft) && eventValue.secondsLeft >= 1 && eventValue.secondsLeft <= eventDefinition.seconds
    ? { id: eventDefinition.id, secondsLeft: eventValue.secondsLeft }
    : null;
  return {
    amounts: { ...initialState.amounts, ...keepCounts(value.amounts, resources.map((resource) => resource.id)) },
    owned: { ...initialState.owned, ...keepCounts(value.owned, [...upgrades, ...tools, ...zones].map((purchase) => purchase.id)) },
    paused: keepUpgradeIds(value.paused),
    stats: {
      clicks: keepCounts(value.stats, ["clicks"] as const).clicks ?? initialState.stats.clicks,
      ticks: keepCounts(value.stats, ["ticks"] as const).ticks ?? initialState.stats.ticks,
      gathered: { ...initialState.stats.gathered, ...keepCounts(isRecord(value.stats) ? value.stats.gathered : undefined, resources.map((resource) => resource.id)) },
    },
    lifetime: {
      clicks: keepCounts(value.lifetime, ["clicks"] as const).clicks ?? 0,
      ticks: keepCounts(value.lifetime, ["ticks"] as const).ticks ?? 0,
      gathered: keepCounts(value.lifetime, ["gathered"] as const).gathered ?? 0,
    },
    event,
    achievements: keepAchievementIds(value.achievements),
    prestige: { emeralds: keepCounts(value.prestige, ["emeralds"] as const).emeralds ?? 0, worlds: keepCounts(value.prestige, ["worlds"] as const).worlds ?? 0, perks: keepPerkIds(isRecord(value.prestige) ? value.prestige.perks : undefined) },
  };
}

function keepPerkIds(value: unknown): PerkId[] {
  const known = new Set<string>(perks.map((perk) => perk.id));
  if (!Array.isArray(value)) return [];
  const kept: PerkId[] = [];
  for (const id of value) if (typeof id === "string" && known.has(id) && !kept.includes(id as PerkId)) kept.push(id as PerkId);
  return kept;
}

function keepUpgradeIds(value: unknown): UpgradeId[] {
  const known = new Set<string>(upgrades.map((upgrade) => upgrade.id));
  if (!Array.isArray(value)) return [];
  const kept: UpgradeId[] = [];
  for (const id of value) if (typeof id === "string" && known.has(id) && !kept.includes(id as UpgradeId)) kept.push(id as UpgradeId);
  return kept;
}

function keepAchievementIds(value: unknown): AchievementId[] {
  const known = new Set<string>(achievements.map((achievement) => achievement.id));
  if (!Array.isArray(value)) return [];
  const kept: AchievementId[] = [];
  for (const id of value) if (typeof id === "string" && known.has(id) && !kept.includes(id as AchievementId)) kept.push(id as AchievementId);
  return kept;
}

function isRecord(value: unknown): value is SaveRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function keepCounts<Id extends string>(value: unknown, ids: readonly Id[]): Partial<Record<Id, number>> {
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
