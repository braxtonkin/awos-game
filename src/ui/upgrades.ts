import { buy, canBuy, costOf, isDiscovered, ownedCount } from "../game.ts";
import { upgradeDetails } from "../format.ts";
import { upgrades } from "../upgrades.ts";
import type { ResourceId } from "../resources.ts";
import type { Section } from "./section.ts";

export const upgradesSection: Section = {
  id: "upgrades",
  title: "Upgrades",
  build({ root, state, update }) {
    const document = root.ownerDocument;
    const list = document.createElement("ul");
    list.id = "upgrades";
    root.append(list);
    const redraws = upgrades.map((upgrade) => {
      const row = document.createElement("li");
      row.dataset.upgrade = upgrade.id;
      const details = document.createElement("div");
      details.className = "details";
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = upgrade.name;
      const owned = document.createElement("span");
      const detailLines = upgradeDetails(upgrade, costOf(state(), upgrade.id)).map((line) => {
        const text = document.createElement("span");
        text.textContent = line;
        return text;
      });
      details.append(name, ...detailLines, owned);
      const button = document.createElement("button");
      button.textContent = "Buy";
      button.addEventListener("click", () => update(buy(state(), upgrade.id)));
      row.append(details, button);
      list.append(row);
      return () => {
        row.hidden = !(Object.keys(upgrade.cost) as ResourceId[]).every((id) => isDiscovered(state(), id));
        upgradeDetails(upgrade, costOf(state(), upgrade.id)).forEach((line, index) => {
          const detail = detailLines[index];
          if (detail !== undefined) detail.textContent = line;
        });
        owned.textContent = `Owned: ${ownedCount(state(), upgrade.id)}`;
        button.disabled = !canBuy(state(), upgrade.id);
      };
    });
    return () => redraws.forEach((redraw) => redraw());
  },
};
