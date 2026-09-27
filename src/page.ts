import { catchUp, tick } from "./game.ts";
import type { GameState } from "./game.ts";
import { loadSave, serialize } from "./save.ts";
import { sections } from "./ui/sections.ts";
import { tabs } from "./ui/tabs.ts";
import type { Section } from "./ui/section.ts";

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
  const configuredSectionIds = new Set<string>(tabs.flatMap((tab) => tab.sections));
  const tabSections = new Map<string, Section[]>(tabs.map((tab) => [
    tab.id,
    sections.filter((section) => tab.id === "more"
      ? (tab.sections as readonly string[]).includes(section.id) || !configuredSectionIds.has(section.id)
      : (tab.sections as readonly string[]).includes(section.id)),
  ]));
  let selectedTab: string = "mine";
  const nav = root.ownerDocument.createElement("nav");
  nav.setAttribute("role", "tablist");
  const tabButtons = tabs.map((tab) => {
    const button = root.ownerDocument.createElement("button");
    button.type = "button";
    button.setAttribute("role", "tab");
    button.textContent = tab.label;
    button.addEventListener("click", () => {
      selectedTab = tab.id;
      renderTabs();
    });
    nav.append(button);
    return { id: tab.id, button };
  });
  root.append(nav);
  const sectionElements = new Map<string, HTMLElement>();
  const renderTabs = (): void => {
    for (const { id, button } of tabButtons) {
      button.setAttribute("aria-selected", String(id === selectedTab));
      button.tabIndex = id === selectedTab ? 0 : -1;
    }
    const visible = new Set((tabSections.get(selectedTab) ?? []).map((section) => section.id));
    for (const [id, element] of sectionElements) element.hidden = !visible.has(id);
  };
  const update = (next: GameState): void => {
    state = next;
    redraws.forEach((redraw) => redraw());
    env.storage.setItem(saveKey, serialize(state, env.now()));
  };
  for (const section of sections) {
    const wrapper = root.ownerDocument.createElement("section");
    wrapper.dataset.section = section.id;
    sectionElements.set(section.id, wrapper);
    const heading = root.ownerDocument.createElement("h2");
    heading.textContent = section.title;
    wrapper.append(heading);
    root.append(wrapper);
    redraws.push(section.build({ root: wrapper, state: () => state, update, env }));
  }
  renderTabs();
  update(state);
  return { tick: () => update(tick(state)) };
}
