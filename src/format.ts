import { resources } from "./resources.ts";
import type { Amounts } from "./resources.ts";
import type { Upgrade } from "./upgrades.ts";
import type { Zone } from "./zones.ts";
import { tools } from "./tools.ts";
import type { Recipe } from "./recipes.ts";
import type { Tool } from "./tools.ts";
import { ownedCount } from "./game.ts";
import type { GameState } from "./game.ts";
import type { PurchaseId } from "./game.ts";
import { zones } from "./zones.ts";

export type NumberFormat = "short" | "full" | "scientific";

export function formatAmount(amount: number, numbers: NumberFormat = "short"): string {
  if (numbers === "full") return Math.floor(amount).toLocaleString("en-US");
  if (numbers === "scientific") {
    if (amount < 1_000) return String(Math.floor(amount));
    const exponent = Math.floor(Math.log10(amount));
    const mantissa = Math.floor((amount / 10 ** exponent) * 100) / 100;
    return `${mantissa}e${exponent}`;
  }
  if (amount < 1_000) return String(Math.floor(amount));

  const suffixes = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
  if (amount >= 1e36) {
    const exponent = Math.floor(Math.log10(amount));
    const mantissa = Math.floor((amount / 10 ** exponent) * 10) / 10;
    const value = Number.isInteger(mantissa) ? String(mantissa) : mantissa.toFixed(1);
    return `${value}e${exponent}`;
  }

  let scaled = amount;
  let suffixIndex = -1;
  while (scaled >= 1_000 && suffixIndex < suffixes.length - 1) {
    scaled /= 1_000;
    suffixIndex += 1;
  }
  const rounded = Math.floor(scaled * 10) / 10;
  const value = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${value}${suffixes[suffixIndex]}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${String(Math.floor(seconds % 60)).padStart(2, "0")}s`;
  return `${Math.floor(seconds / 3600)}h ${String(Math.floor(seconds % 3600 / 60)).padStart(2, "0")}m`;
}

export function formatAmounts(amounts: Amounts, numbers: NumberFormat = "short"): string {
  return resources
    .flatMap((resource) => {
      const amount = amounts[resource.id];
      return amount === undefined ? [] : [`${formatAmount(amount, numbers)} ${resource.name}`];
    })
    .join(", ");
}

export function upgradeDetails(upgrade: Upgrade, cost: Amounts, numbers: NumberFormat = "short"): string[] {
  return [
    `Cost: ${formatAmounts(cost, numbers)}`,
    ...(upgrade.uses === undefined ? [] : [`Uses: ${formatAmounts(upgrade.uses, numbers)} per second`]),
    `Makes: ${formatAmounts(upgrade.perTick, numbers)} per second`,
  ];
}

export function zoneDetails(zone: Zone, numbers: NumberFormat = "short"): string[] {
  const tool = tools.find((candidate) => candidate.id === zone.requires);
  return [
    ...(Object.keys(zone.cost).length === 0 ? [] : [`Cost: ${formatAmounts(zone.cost, numbers)}`]),
    ...(zone.requires === null || tool === undefined ? [] : [`Needs: ${tool.name}`]),
    `Mines: ${zone.resources.map((id) => resources.find((resource) => resource.id === id)?.name ?? id).join(", ")}`,
  ];
}

export function recipeDetails(recipe: Recipe, numbers: NumberFormat = "short"): string[] {
  return [
    `Uses: ${formatAmounts(recipe.inputs, numbers)}`,
    `Makes: ${formatAmounts(recipe.outputs, numbers)}`,
  ];
}

export function formatClickPower(power: number): string {
  return `Click power: ×${power}`;
}

export function toolDetails(tool: Tool, numbers: NumberFormat = "short"): string[] {
  return [`Cost: ${formatAmounts(tool.cost, numbers)}`, formatClickPower(tool.clickPower)];
}

export function nextGoal(state: GameState): string {
  const goals: { id: PurchaseId; name: string; cost: Amounts }[] = [];
  for (const zone of zones.slice(1)) {
    if (zone.requires !== null && ownedCount(state, zone.requires) === 0) {
      const tool = tools.find((candidate) => candidate.id === zone.requires);
      if (tool !== undefined) goals.push(tool);
    }
    goals.push(zone);
  }
  for (const tool of tools) {
    if (!goals.some((goal) => goal.id === tool.id)) goals.push(tool);
  }
  const goal = goals.find((candidate) => ownedCount(state, candidate.id) === 0);
  return goal === undefined
    ? "Next goal: Defeat the Ender Dragon."
    : `Next goal: ${goal.name}. Costs ${formatAmounts(goal.cost)}.`;
}
