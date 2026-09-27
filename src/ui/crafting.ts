import { canCraft, craft } from "../game.ts";
import { recipeDetails } from "../format.ts";
import { recipes } from "../recipes.ts";
import type { Section } from "./section.ts";

export const craftingSection: Section = {
  id: "crafting",
  title: "Crafting",
  build({ root, state, update }) {
    const document = root.ownerDocument;
    const list = document.createElement("ul");
    list.id = "crafting";
    root.append(list);
    const redraws = recipes.map((recipe) => {
      const row = document.createElement("li");
      row.dataset.recipe = recipe.id;
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = recipe.name;
      const button = document.createElement("button");
      button.textContent = "Craft";
      button.addEventListener("click", () => update(craft(state(), recipe.id)));
      row.append(name, ...recipeDetails(recipe).map((line) => {
        const detail = document.createElement("span");
        detail.textContent = line;
        return detail;
      }), button);
      list.append(row);
      return () => { button.disabled = !canCraft(state(), recipe.id); };
    });
    return () => redraws.forEach((redraw) => redraw());
  },
};
