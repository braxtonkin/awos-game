import { catchUp, tick } from "./game.ts";
import type { GameState } from "./game.ts";
import { loadSave, serialize } from "./save.ts";
import { sections } from "./ui/sections.ts";
import { achievements } from "./achievements.ts";

export type PageEnv = {
  storage: Pick<Storage, "getItem" | "setItem">;
  now(): number;
  confirm(message: string): boolean;
};

export type Page = { tick(): void };

const saveKey = "awos-game:save";

export function mount(root: HTMLElement, env: PageEnv): Page {
  const loaded = loadSave(env.storage.getItem(saveKey));
  let state = catchUp(loaded.state, loaded.savedAt === null ? 0 : Math.max(0, env.now() - loaded.savedAt));
  const redraws: (() => void)[] = [];
  let toast: HTMLParagraphElement | null = null;
  let toastTicks = 0;
  const update = (next: GameState): void => {
    const added = next.achievements.filter((id) => !state.achievements.includes(id));
    state = next;
    if (added.length > 0) {
      const achievement = achievements.find((item) => item.id === added[0]);
      if (achievement !== undefined) {
        toast?.remove();
        toast = root.ownerDocument.createElement("p");
        toast.className = "toast";
        toast.setAttribute("role", "status");
        toast.textContent = `Achievement earned: ${achievement.name}`;
        root.prepend(toast);
        toastTicks = 5;
      }
    }
    redraws.forEach((redraw) => redraw());
    env.storage.setItem(saveKey, serialize(state, env.now()));
  };
  for (const section of sections) {
    const wrapper = root.ownerDocument.createElement("section");
    wrapper.dataset.section = section.id;
    const heading = root.ownerDocument.createElement("h2");
    heading.textContent = section.title;
    wrapper.append(heading);
    root.append(wrapper);
    redraws.push(section.build({ root: wrapper, state: () => state, update, env }));
  }
  update(state);
  return { tick: () => {
    const existingToast = toast;
    update(tick(state));
    if (existingToast !== null && toast === existingToast) {
      toastTicks -= 1;
      if (toastTicks <= 0) { toast.remove(); toast = null; }
    }
  } };
}
