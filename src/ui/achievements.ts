import { achievements } from "../achievements.ts";
import type { Section } from "./section.ts";

export const achievementsSection: Section = {
  id: "achievements",
  title: "Achievements",
  build({ root, state }) {
    const summary = root.ownerDocument.createElement("p");
    const list = root.ownerDocument.createElement("ul");
    root.append(summary, list);
    const rows = achievements.map((achievement) => {
      const row = root.ownerDocument.createElement("li");
      row.dataset.achievement = achievement.id;
      const name = root.ownerDocument.createElement("span");
      name.className = "name";
      name.textContent = achievement.name;
      const description = root.ownerDocument.createElement("span");
      description.textContent = achievement.description;
      const status = root.ownerDocument.createElement("span");
      row.append(name, description, status);
      list.append(row);
      return { id: achievement.id, status };
    });
    return () => {
      const earned = state().achievements;
      summary.textContent = `Earned ${earned.length} of ${achievements.length}`;
      rows.forEach(({ id, status }) => { status.textContent = earned.includes(id) ? "Earned" : "Not yet"; });
    };
  },
};
