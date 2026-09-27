import { buy, canBuy, ownedCount, zoneReached } from "../game.ts";
import { zoneDetails } from "../format.ts";
import { zones } from "../zones.ts";
import type { Section } from "./section.ts";

export const zonesSection: Section = {
  id: "zones",
  title: "Zones",
  build({ root, state, update }) {
    const document = root.ownerDocument;
    const list = document.createElement("ul");
    list.id = "zones";
    root.append(list);
    const redraws = zones.map((zone, index) => {
      const row = document.createElement("li");
      row.dataset.zone = zone.id;
      const details = document.createElement("div");
      details.className = "details";
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = zone.name;
      details.append(name, ...zoneDetails(zone).map((line) => {
        const detail = document.createElement("span");
        detail.textContent = line;
        return detail;
      }));
      const button = document.createElement("button");
      button.addEventListener("click", () => update(buy(state(), zone.id)));
      row.append(details, button);
      list.append(row);
      return () => {
        row.hidden = index > 0 && !zoneReached(state(), zones[index - 1]!.id);
        const reached = ownedCount(state(), zone.id) > 0 || zone.id === zones[0]?.id;
        button.textContent = reached ? "Reached" : "Explore";
        button.disabled = reached || !canBuy(state(), zone.id);
      };
    });
    return () => redraws.forEach((redraw) => redraw());
  },
};
