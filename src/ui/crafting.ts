import { canCraft, craft, isDiscovered } from "../game.ts";
import { recipeDetails } from "../format.ts";
import { recipes } from "../recipes.ts";
import type { ResourceId } from "../resources.ts";
import type { Section } from "./section.ts";
import { rowButton } from "./row-button.ts";

export const craftingSection: Section = {
  id: "crafting",
  title: "Crafting",
  build({ root, state, update, settings }) {
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
      const button = rowButton(document, "Craft", recipe.name);
      button.addEventListener("click", () => update(craft(state(), recipe.id)));
      row.append(name, ...recipeDetails(recipe, settings().numbers).map((line) => {
        const detail = document.createElement("span");
        detail.textContent = line;
        return detail;
      }), button);
      list.append(row);
      return () => {
        row.hidden = !(Object.keys(recipe.inputs) as ResourceId[]).every((id) => isDiscovered(state(), id));
        button.disabled = !canCraft(state(), recipe.id);
      };
    });
    return () => redraws.forEach((redraw) => redraw());
  },
};
