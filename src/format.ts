import { resources } from "./resources.ts";
import type { Amounts } from "./resources.ts";
import type { Upgrade } from "./upgrades.ts";

export function formatAmounts(amounts: Amounts): string {
  return resources
    .flatMap((resource) => {
      const amount = amounts[resource.id];
      return amount === undefined ? [] : [`${amount} ${resource.name}`];
    })
    .join(", ");
}

export function upgradeDetails(upgrade: Upgrade): string[] {
  return [`Cost: ${formatAmounts(upgrade.cost)}`, `Makes: ${formatAmounts(upgrade.perTick)} per second`];
}
