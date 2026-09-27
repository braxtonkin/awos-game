import { canStartNewWorld, emeraldsForNewWorld, startNewWorld } from "../game.ts";
import type { Section } from "./section.ts";

export const newWorldSection: Section = {
  id: "newWorld",
  title: "New world",
  build({ root, state, update, env }) {
    const summary = root.ownerDocument.createElement("p");
    const button = root.ownerDocument.createElement("button");
    button.textContent = "Start a new world";
    button.addEventListener("click", () => {
      if (canStartNewWorld(state()) && env.confirm("Start a new world? You keep your Emeralds and achievements. Everything else starts over.")) update(startNewWorld(state()));
    });
    root.append(summary, button);
    return () => {
      const current = state();
      const gain = emeraldsForNewWorld(current);
      summary.textContent = `Emeralds: ${current.prestige.emeralds} · Bonus: +${10 * current.prestige.emeralds}% production and click power · A new world now gives ${gain} Emeralds. You need at least 10.`;
      button.disabled = !canStartNewWorld(current);
    };
  },
};
