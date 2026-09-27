import { performance } from "node:perf_hooks";
import { earnAchievements, initialState, catchUp, productionMultiplier, type GameState } from "../src/game.ts";
import { events } from "../src/events.ts";
import { resources, type Amounts } from "../src/resources.ts";
import { upgrades } from "../src/upgrades.ts";

function referenceTick(state: GameState): GameState {
  const producing = upgrades.filter((upgrade) => upgrade.uses === undefined);
  const consuming = upgrades.filter((upgrade) => upgrade.uses !== undefined);
  const activeProducing = state.paused.length === 0 ? producing : producing.filter((upgrade) => !state.paused.includes(upgrade.id as never));
  const activeConsuming = state.paused.length === 0 ? consuming : consuming.filter((upgrade) => !state.paused.includes(upgrade.id as never));
  const output = activeProducing.reduce<Amounts>((totals, upgrade) => {
    const multiplied = resources.reduce<Amounts>((amounts, resource) => {
      const count = upgrade.perTick[resource.id as keyof Amounts];
      return count === undefined ? amounts : { ...amounts, [resource.id]: count * productionMultiplier(state, resource.id as never) };
    }, {});
    return mergeAmounts(totals, scaleAmounts(multiplied, ownedCount(state, upgrade.id)));
  }, {});
  const produced = addAmounts(state, output, 1);
  const consumedOutput: Amounts = {};
  const result = activeConsuming.reduce((next, upgrade) => {
    let result = next;
    const uses = upgrade.uses ?? {};
    for (let count = 0; count < ownedCount(state, upgrade.id); count += 1) {
      const canUse = resources.every((resource) => {
        const needed = uses[resource.id as keyof Amounts];
        return needed === undefined || amountOf(result, resource.id) >= needed;
      });
      if (canUse) {
        const multiplied = resources.reduce<Amounts>((amounts, resource) => {
          const value = upgrade.perTick[resource.id as keyof Amounts];
          return value === undefined ? amounts : { ...amounts, [resource.id]: value * productionMultiplier(state, resource.id as never) };
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
    const loss = definition.effect.resources.reduce<Amounts>((amounts, resource) => ({ ...amounts, [resource]: Math.floor(amountOf(result, resource) * definition.effect.share) }), {});
    finalResult = addAmounts(result, loss, -1);
  }
  return earnAchievements({ ...finalResult, event: secondsLeft > 0 && state.event !== null ? { ...state.event, secondsLeft } : null, stats: { ...state.stats, ticks: state.stats.ticks + 1, gathered: mergeAmounts(state.stats.gathered, mergeAmounts(output, consumedOutput)) } });
}

function amountOf(state: GameState, resource: string): number { return state.amounts[resource as keyof Amounts] ?? 0; }
function ownedCount(state: GameState, id: string): number { return state.owned[id as keyof GameState["owned"]] ?? 0; }
function addAmounts(state: GameState, amounts: Amounts, factor: number): GameState {
  if (factor === 0) return state;
  return { ...state, amounts: resources.reduce<Amounts>((totals, resource) => {
    const change = amounts[resource.id as keyof Amounts];
    return change === undefined ? totals : { ...totals, [resource.id]: amountOf(state, resource.id) + change * factor };
  }, state.amounts) };
}
function mergeAmounts(left: Amounts, right: Amounts): Amounts {
  return resources.reduce<Amounts>((result, resource) => {
    const amount = (left[resource.id as keyof Amounts] ?? 0) + (right[resource.id as keyof Amounts] ?? 0);
    return amount === 0 ? result : { ...result, [resource.id]: amount };
  }, {});
}
function scaleAmounts(amounts: Amounts, factor: number): Amounts {
  return resources.reduce<Amounts>((result, resource) => {
    const amount = amounts[resource.id as keyof Amounts];
    return amount === undefined || factor === 0 ? result : { ...result, [resource.id]: amount * factor };
  }, {});
}

const state: GameState = {
  ...initialState,
  amounts: Object.fromEntries(resources.map(({ id }) => [id, 1000])),
  owned: Object.fromEntries(upgrades.map(({ id }) => [id, 10])),
  event: { id: "rain", secondsLeft: 60 },
  achievements: ["firstLog", "lumberjack", "stoneTools", "intoTheDark", "ironWorks", "ironTools", "torchbearer", "busyHands", "factory", "stockpile", "deeper", "shiny", "diamondTools", "goldRush", "clickStorm", "machinist", "smeltery", "torchlight", "obsidianWall", "millionaire", "tooHot", "netheriteTools", "blazing", "pearlDiver", "ancientHistory", "freshStart", "worldHopper", "emeraldHoard", "lavaLord", "tenMillion"],
};

const startedReference = performance.now();
let reference = state;
for (let second = 0; second < 28_800; second += 1) reference = referenceTick(reference);
const referenceMs = performance.now() - startedReference;
const startedCatchUp = performance.now();
catchUp(state, 28_800_000);
const catchUpMs = performance.now() - startedCatchUp;
console.log(`Reference: ${referenceMs.toFixed(1)} ms`);
console.log(`catchUp:   ${catchUpMs.toFixed(1)} ms`);
console.log(`Ratio:     ${(referenceMs / catchUpMs).toFixed(2)}x`);
