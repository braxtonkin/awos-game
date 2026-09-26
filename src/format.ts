import { resources } from "./resources.ts";
import type { Amounts } from "./resources.ts";
import type { Upgrade } from "./upgrades.ts";

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
