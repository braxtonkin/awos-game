import { formatAmount, formatDuration } from "../format.ts";
import { resources } from "../resources.ts";
import type { Section } from "./section.ts";

export const statsSection: Section = {
  id: "stats",
  title: "Stats",
  build({ root, state, settings }) {
    const list = root.ownerDocument.createElement("ul");
    list.dataset.stats = "";
    root.append(list);
    return () => {
      const current = state().stats;
      list.replaceChildren();
      const lines = [
        `Time in this world: ${formatDuration(current.ticks)}`,
        `Clicks: ${current.clicks}`,
        `Gathered in total: ${formatAmount(resources.reduce((sum, resource) => sum + (current.gathered[resource.id] ?? 0), 0), settings().numbers)}`,
        ...resources.flatMap((resource) => {
          const amount = current.gathered[resource.id] ?? 0;
          return amount > 0 ? [`${resource.name} gathered: ${formatAmount(amount, settings().numbers)}`] : [];
        }),
      ];
      for (const line of lines) {
        const item = root.ownerDocument.createElement("li");
        item.textContent = line;
        list.append(item);
      }
    };
  },
};
