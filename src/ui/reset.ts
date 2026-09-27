import { initialState } from "../game.ts";
import type { Section } from "./section.ts";

export const resetSection: Section = {
  id: "reset",
  title: "Game",
  build({ root, update, env }) {
    const button = root.ownerDocument.createElement("button");
    button.textContent = "Reset";
    button.addEventListener("click", () => {
      if (env.confirm("Start a new game? Your progress will be lost.")) update(initialState);
    });
    root.append(button);
    return () => {};
  },
};
