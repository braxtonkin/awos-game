import { attack, zoneReached } from "../game.ts";
import { formatAmount } from "../format.ts";
import type { Section } from "./section.ts";
import { rowButton } from "./row-button.ts";

export const dragonSection: Section = {
  id: "dragon",
  title: "Ender Dragon",
  build({ root, state, update }) {
    const document = root.ownerDocument;
    const health = document.createElement("p");
    const victory = document.createElement("p");
    const reward = document.createElement("p");
    const button = rowButton(document, "Attack", "Ender Dragon");
    button.addEventListener("click", () => update(attack(state())));
    root.append(health, button, victory, reward);
    return () => {
      const current = state();
      root.hidden = !zoneReached(current, "end");
      health.textContent = `Health: ${formatAmount(current.dragonHealth)} of 200K`;
      button.hidden = current.dragonHealth <= 0;
      victory.textContent = current.dragonHealth <= 0 ? "You defeated the Ender Dragon!" : "";
      reward.textContent = current.dragonHealth <= 0 ? "Start a new world to earn 10 extra Emeralds." : "";
    };
  },
};
