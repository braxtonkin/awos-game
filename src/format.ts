import { resources } from "./resources.ts";
import type { Amounts } from "./resources.ts";
import type { Upgrade } from "./upgrades.ts";
import type { Zone } from "./zones.ts";
import { tools } from "./tools.ts";

export function formatAmount(amount: number): string {
  if (amount < 1_000) return String(amount);

  const suffixes = ["K", "M", "B"];
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

export function formatAmounts(amounts: Amounts): string {
  return resources
    .flatMap((resource) => {
      const amount = amounts[resource.id];
      return amount === undefined ? [] : [`${formatAmount(amount)} ${resource.name}`];
    })
    .join(", ");
}

export function upgradeDetails(upgrade: Upgrade): string[] {
  return [
    `Cost: ${formatAmounts(upgrade.cost)}`,
    ...(upgrade.uses === undefined ? [] : [`Uses: ${formatAmounts(upgrade.uses)} per second`]),
    `Makes: ${formatAmounts(upgrade.perTick)} per second`,
  ];
}

export function zoneDetails(zone: Zone): string[] {
  const tool = tools.find((candidate) => candidate.id === zone.requires);
  return [
    ...(Object.keys(zone.cost).length === 0 ? [] : [`Cost: ${formatAmounts(zone.cost)}`]),
    ...(zone.requires === null || tool === undefined ? [] : [`Needs: ${tool.name}`]),
    `Mines: ${zone.resources.map((id) => resources.find((resource) => resource.id === id)?.name ?? id).join(", ")}`,
  ];
}
