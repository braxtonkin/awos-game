import { catchUp, rollEvent, tick } from "./game.ts";
import type { GameState } from "./game.ts";
import { loadSave, serialize } from "./save.ts";
import { sections } from "./ui/sections.ts";

export type PageEnv = {
  storage: Pick<Storage, "getItem" | "setItem">;
  now(): number;
  confirm(message: string): boolean;
  random(): number;
};

export type Page = { tick(): void };

const saveKey = "awos-game:save";

export function mount(root: HTMLElement, env: PageEnv): Page {
  const loaded = loadSave(env.storage.getItem(saveKey));
  let state = catchUp(loaded.state, loaded.savedAt === null ? 0 : Math.max(0, env.now() - loaded.savedAt));
  const redraws: (() => void)[] = [];
  const update = (next: GameState): void => {
    state = next;
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
  return { tick: () => update(rollEvent(tick(state), env.random(), env.random())) };
}
