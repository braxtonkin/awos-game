import { resources } from "./resources.ts";
import type { Amounts } from "./resources.ts";
import type { Upgrade } from "./upgrades.ts";
import type { Tool } from "./tools.ts";

export function formatAmount(amount: number): string {
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

export function formatAmounts(amounts: Amounts): string {
  return resources
    .flatMap((resource) => {
      const amount = amounts[resource.id];
      return amount === undefined ? [] : [`${formatAmount(amount)} ${resource.name}`];
    })
    .join(", ");
}

export function upgradeDetails(upgrade: Upgrade, cost: Amounts): string[] {
  return [
    `Cost: ${formatAmounts(cost)}`,
    ...(upgrade.uses === undefined ? [] : [`Uses: ${formatAmounts(upgrade.uses)} per second`]),
    `Makes: ${formatAmounts(upgrade.perTick)} per second`,
  ];
}

export function formatClickPower(power: number): string {
  return `Click power: ×${power}`;
}

export function toolDetails(tool: Tool): string[] {
  return [`Cost: ${formatAmounts(tool.cost)}`, formatClickPower(tool.clickPower)];
}
