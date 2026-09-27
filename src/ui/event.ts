import { events } from "../events.ts";
import type { Section } from "./section.ts";

export const eventSection: Section = {
  id: "event",
  title: "Event",
  build({ root, state }) {
    const text = root.ownerDocument.createElement("p");
    text.className = "event-text";
    const time = root.ownerDocument.createElement("p");
    time.className = "event-time";
    root.append(text, time);
    return () => {
      const active = state().event;
      const definition = events.find((event) => event.id === active?.id);
      if (active === null || definition === undefined) {
        root.setAttribute("hidden", "");
        text.textContent = "";
        time.textContent = "";
      } else {
        root.removeAttribute("hidden");
        text.textContent = definition.text;
        time.textContent = `${active.secondsLeft}s left`;
      }
    };
  },
};
