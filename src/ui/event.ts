import { events } from "../events.ts";
import { canAffordEvent, resolveEvent } from "../game.ts";
import type { Section } from "./section.ts";

export const eventSection: Section = {
  id: "event",
  title: "Event",
  build({ root, state, update }) {
    const text = root.ownerDocument.createElement("p");
    text.className = "event-text";
    const time = root.ownerDocument.createElement("p");
    time.className = "event-time";
    const action = root.ownerDocument.createElement("button");
    root.append(text, action, time);
    action.addEventListener("click", () => update(resolveEvent(state())));
    return () => {
      const active = state().event;
      const definition = events.find((event) => event.id === active?.id);
      if (active === null || definition === undefined) {
        root.setAttribute("hidden", "");
        text.textContent = "";
        time.textContent = "";
        action.hidden = true;
      } else {
        root.removeAttribute("hidden");
        text.textContent = definition.text;
        time.textContent = `${active.secondsLeft}s left`;
        const label = definition.effect.kind === "chest" ? "Open" : definition.effect.kind === "creeper" ? "Defuse" : definition.effect.kind === "trade" ? "Trade" : "";
        action.hidden = label === "";
        action.textContent = label;
        action.disabled = definition.effect.kind === "trade" && !canAffordEvent(state(), definition.effect.give);
      }
    };
  },
};
