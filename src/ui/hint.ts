import { nextGoal } from "../format.ts";
import type { Section } from "./section.ts";

export const hintSection: Section = {
  id: "hint",
  title: "Next goal",
  build({ root, state }) {
    const paragraph = root.ownerDocument.createElement("p");
    paragraph.className = "next-goal";
    root.append(paragraph);
    const redraw = () => { paragraph.textContent = nextGoal(state()); };
    redraw();
    return redraw;
  },
};
