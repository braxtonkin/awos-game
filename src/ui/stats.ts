import { formatAmount, formatDuration } from "../format.ts";
import { resources } from "../resources.ts";
import { zones } from "../zones.ts";
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
      const lifetime = state().lifetime;
      const gathered = resources.reduce((sum, resource) => sum + (current.gathered[resource.id] ?? 0), 0);
      list.replaceChildren();
      const lines = [
        `Time in this world: ${formatDuration(current.ticks)}`,
        `Clicks: ${current.clicks}`,
        `Gathered in total: ${formatAmount(resources.reduce((sum, resource) => sum + (current.gathered[resource.id] ?? 0), 0), settings().numbers)}`,
        ...resources.flatMap((resource) => {
          const amount = current.gathered[resource.id] ?? 0;
          return amount > 0 ? [`${resource.name} gathered: ${formatAmount(amount, settings().numbers)}`] : [];
        }),
        "All worlds",
        `Worlds started: ${state().prestige.worlds}`,
        `Time in all worlds: ${formatDuration(lifetime.ticks + current.ticks)}`,
        `Clicks in all worlds: ${lifetime.clicks + current.clicks}`,
        `Gathered in all worlds: ${formatAmount(lifetime.gathered + gathered, settings().numbers)}`,
        ...zones.flatMap((zone) => {
          const record = lifetime.records[zone.id];
          return record === undefined ? [] : [`Fastest to ${zone.name}: ${formatDuration(record)}`];
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
