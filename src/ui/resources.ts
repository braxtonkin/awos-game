import { amountOf, canMine, isDiscovered, mine } from "../game.ts";
import { formatAmount } from "../format.ts";
import { resources } from "../resources.ts";
import type { Section } from "./section.ts";

export const resourcesSection: Section = {
  id: "resources",
  title: "Resources",
  build({ root, state, update, settings }) {
    const document = root.ownerDocument;
    const list = document.createElement("ul");
    list.id = "resources";
    root.append(list);
    const redraws = resources.map((resource) => {
      const row = document.createElement("li");
      row.dataset.resource = resource.id;
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = resource.name;
      const amount = document.createElement("span");
      amount.className = "amount";
      row.append(name, amount);
      if (resource.perClick > 0) {
        const button = document.createElement("button");
        button.textContent = "Mine";
        button.addEventListener("click", () => update(mine(state(), resource.id)));
        row.append(button);
      }
      list.append(row);
      return () => {
        row.hidden = !isDiscovered(state(), resource.id);
        amount.textContent = formatAmount(amountOf(state(), resource.id), settings().numbers);
        const button = row.querySelector("button");
        if (button) {
          button.textContent = canMine(state(), resource.id) ? "Mine" : "Locked";
          button.disabled = !canMine(state(), resource.id);
        }
      };
    });
    return () => redraws.forEach((redraw) => redraw());
  },
};
