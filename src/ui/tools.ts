import { buy, canBuy, clickPower, ownedCount } from "../game.ts";
import { formatClickPower, toolDetails } from "../format.ts";
import { tools } from "../tools.ts";
import type { Section } from "./section.ts";

export const toolsSection: Section = {
  id: "tools",
  title: "Tools",
  build({ root, state, update }) {
    const document = root.ownerDocument;
    const power = document.createElement("p");
    power.className = "click-power";
    root.append(power);
    const list = document.createElement("ul");
    list.id = "tools";
    root.append(list);
    const redraws = tools.map((tool) => {
      const row = document.createElement("li");
      row.dataset.tool = tool.id;
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = tool.name;
      row.append(name, ...toolDetails(tool).map((line) => {
        const detail = document.createElement("span");
        detail.textContent = line;
        return detail;
      }));
      const button = document.createElement("button");
      button.addEventListener("click", () => update(buy(state(), tool.id)));
      row.append(button);
      list.append(row);
      return () => {
        const owned = ownedCount(state(), tool.id) > 0;
        button.textContent = owned ? "Owned" : "Buy";
        button.disabled = owned || !canBuy(state(), tool.id);
      };
    });
    return () => {
      power.textContent = formatClickPower(clickPower(state()));
      redraws.forEach((redraw) => redraw());
    };
  },
};
