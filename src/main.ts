import { upgradeDetails } from "./format.ts";
import { amountOf, buy, canBuy, initialState, mine, ownedCount, tick, tickMs } from "./game.ts";
import type { GameState } from "./game.ts";
import { resources } from "./resources.ts";
import { deserialize, serialize } from "./save.ts";
import { upgrades } from "./upgrades.ts";

const saveKey = "awos-game:save";

let state = deserialize(localStorage.getItem(saveKey));

const resourceList = byId("resources");
const upgradeList = byId("upgrades");
const resetButton = element("button", "Reset");
resetButton.addEventListener("click", () => {
  if (window.confirm("Start a new game? Your progress will be lost.")) {
    update(initialState);
  }
});
upgradeList.parentElement?.append(resetButton);

const redraws = [
  ...resources.map((resource) => {
    const name = element("span", resource.name);
    name.className = "name";
    const amount = element("span");
    amount.className = "amount";
    const mineButton = element("button", "Mine");
    mineButton.addEventListener("click", () => {
      update(mine(state, resource.id));
    });
    resourceList.append(element("li", name, amount, mineButton));
    return () => {
      amount.textContent = String(amountOf(state, resource.id));
    };
  }),
  ...upgrades.map((upgrade) => {
    const name = element("span", upgrade.name);
    name.className = "name";
    const owned = element("span");
    const details = element(
      "div",
      name,
      ...upgradeDetails(upgrade).map((line) => element("span", line)),
      owned,
    );
    details.className = "details";
    const buyButton = element("button", "Buy");
    buyButton.addEventListener("click", () => {
      update(buy(state, upgrade.id));
    });
    upgradeList.append(element("li", details, buyButton));
    return () => {
      owned.textContent = `Owned: ${ownedCount(state, upgrade.id)}`;
      buyButton.disabled = !canBuy(state, upgrade.id);
    };
  }),
];

update(state);
setInterval(() => {
  update(tick(state));
}, tickMs);

function update(next: GameState): void {
  state = next;
  for (const redraw of redraws) {
    redraw();
  }
  localStorage.setItem(saveKey, serialize(state));
}

function byId(id: string): HTMLElement {
  const found = document.getElementById(id);
  if (found === null) {
    throw new Error(`index.html has no element with id "${id}"`);
  }
  return found;
}

function element<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  ...children: (Node | string)[]
): HTMLElementTagNameMap[Tag] {
  const created = document.createElement(tag);
  created.append(...children);
  return created;
}
