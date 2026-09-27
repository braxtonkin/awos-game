import { buyPerk, canStartNewWorld, emeraldsForNewWorld, startNewWorld } from "../game.ts";
import { perks } from "../perks.ts";
import type { Section } from "./section.ts";

export const newWorldSection: Section = {
  id: "newWorld",
  title: "New world",
  build({ root, state, update, env }) {
    const summary = root.ownerDocument.createElement("p");
    const button = root.ownerDocument.createElement("button");
    const list = root.ownerDocument.createElement("ul");
    const rows = perks.map((perk) => {
      const row = root.ownerDocument.createElement("li");
      row.dataset.perk = perk.id;
      const name = root.ownerDocument.createElement("span");
      name.className = "name";
      const description = root.ownerDocument.createElement("span");
      const cost = root.ownerDocument.createElement("span");
      const buy = root.ownerDocument.createElement("button");
      buy.addEventListener("click", () => update(buyPerk(state(), perk.id)));
      row.append(name, description, cost, buy);
      list.append(row);
      return { perk, name, description, cost, buy };
    });
    button.textContent = "Start a new world";
    button.addEventListener("click", () => {
      if (canStartNewWorld(state()) && env.confirm("Start a new world? You keep your Emeralds and achievements. Everything else starts over.")) update(startNewWorld(state()));
    });
    const note = root.ownerDocument.createElement("p");
    note.textContent = "Spending Emeralds lowers your Emerald bonus.";
    root.append(summary, button, list, note);
    return () => {
      const current = state();
      const gain = emeraldsForNewWorld(current);
      summary.textContent = `Emeralds: ${current.prestige.emeralds} · Bonus: +${10 * current.prestige.emeralds}% production and click power · A new world now gives ${gain} Emeralds. You need at least 10.`;
      button.disabled = !canStartNewWorld(current);
      for (const row of rows) {
        row.name.textContent = row.perk.name;
        row.description.textContent = row.perk.description;
        row.cost.textContent = `Cost: ${row.perk.cost} Emeralds`;
        row.buy.textContent = current.prestige.perks.includes(row.perk.id) ? "Owned" : "Buy";
        row.buy.disabled = current.prestige.perks.includes(row.perk.id) || current.prestige.emeralds < row.perk.cost;
      }
    };
  },
};
