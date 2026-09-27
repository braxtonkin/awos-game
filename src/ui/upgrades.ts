import { buyMany, costOfMany, isDiscovered, maxAffordable, ownedCount, togglePause } from "../game.ts";
import { upgradeDetails } from "../format.ts";
import { upgrades } from "../upgrades.ts";
import type { ResourceId } from "../resources.ts";
import type { Section } from "./section.ts";

type Mode = 1 | 10 | "max";

export const upgradesSection: Section = {
  id: "upgrades",
  title: "Upgrades",
  build({ root, state, update }) {
    const document = root.ownerDocument;
    let mode: Mode = 1;
    const controls = document.createElement("div");
    const modeButtons = ([1, 10, "max"] as const).map((value) => {
      const button = document.createElement("button");
      button.textContent = value === "max" ? "Max" : `×${value}`;
      button.setAttribute("aria-pressed", String(value === mode));
      button.addEventListener("click", () => { mode = value; redraw(); });
      controls.append(button);
      return { button, value };
    });
    root.append(controls);
    const list = document.createElement("ul");
    list.id = "upgrades";
    root.append(list);
    const redraws = upgrades.map((upgrade) => {
      const row = document.createElement("li");
      row.dataset.upgrade = upgrade.id;
      const details = document.createElement("div");
      details.className = "details";
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = upgrade.name;
      const owned = document.createElement("span");
      const detailLines = upgradeDetails(upgrade, {}).map(() => document.createElement("span"));
      details.append(name, ...detailLines, owned);
      const button = document.createElement("button");
      button.addEventListener("click", () => update(buyMany(state(), upgrade.id, batch(upgrade.id))));
      const pauseButton = upgrade.uses === undefined ? undefined : document.createElement("button");
      const paused = upgrade.uses === undefined ? undefined : document.createElement("span");
      if (pauseButton !== undefined && paused !== undefined) {
        pauseButton.addEventListener("click", () => update(togglePause(state(), upgrade.id)));
        row.append(details, button, pauseButton, paused);
      } else row.append(details, button);
      list.append(row);
      return () => {
        const count = batch(upgrade.id);
        row.hidden = !(Object.keys(upgrade.cost) as ResourceId[]).every((id) => isDiscovered(state(), id));
        upgradeDetails(upgrade, costOfMany(state(), upgrade.id, count)).forEach((line, index) => {
          const detail = detailLines[index];
          if (detail !== undefined) detail.textContent = line;
        });
        owned.textContent = `Owned: ${ownedCount(state(), upgrade.id)}`;
        const max = mode === "max";
        button.textContent = max ? `Buy max (${count})` : count === 1 ? "Buy" : `Buy ${count}`;
        button.disabled = count === 0 || !affordable(upgrade.id, count);
        if (pauseButton !== undefined && paused !== undefined) {
          const isPaused = state().paused.includes(upgrade.id);
          pauseButton.textContent = isPaused ? "Resume" : "Pause";
          paused.textContent = isPaused ? "Paused" : "";
        }
      };
    });
    function batch(id: typeof upgrades[number]["id"]): number {
      return mode === "max" ? maxAffordable(state(), id) : mode;
    }
    function affordable(id: typeof upgrades[number]["id"], count: number): boolean {
      return maxAffordable(state(), id) >= count;
    }
    function redraw(): void {
      modeButtons.forEach(({ button, value }) => button.setAttribute("aria-pressed", String(value === mode)));
      redraws.forEach((redrawRow) => redrawRow());
    }
    return redraw;
  },
};
