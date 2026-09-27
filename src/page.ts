import { catchUp, rollEvent, tick } from "./game.ts";
import type { GameState } from "./game.ts";
import { loadSave, serialize } from "./save.ts";
import { sections } from "./ui/sections.ts";
import { achievements } from "./achievements.ts";
import { tabs } from "./ui/tabs.ts";
import type { Section } from "./ui/section.ts";
import { parseSettings, settingsKey } from "./settings.ts";
import type { Settings } from "./settings.ts";

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
  let settings = parseSettings(env.storage.getItem(settingsKey));
  const redraws: (() => void)[] = [];
  let toast: HTMLParagraphElement | null = null;
  let toastTicks = 0;
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
    const controlledSection = tabSections.get(tab.id)?.[0];
    if (controlledSection !== undefined) button.setAttribute("aria-controls", `panel-${controlledSection.id}`);
    button.textContent = tab.label;
    button.addEventListener("click", () => {
      selectedTab = tab.id;
      renderTabs();
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const current = tabs.findIndex((item) => item.id === tab.id);
      const delta = event.key === "ArrowRight" ? 1 : -1;
      selectedTab = tabs[(current + delta + tabs.length) % tabs.length]!.id;
      renderTabs();
      tabButtons.find((item) => item.id === selectedTab)?.button.focus();
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
  const updateSettings = (next: Settings): void => {
    settings = next;
    env.storage.setItem(settingsKey, JSON.stringify(settings));
    applyTheme();
    redraws.forEach((redraw) => redraw());
  };
  const applyTheme = (): void => {
    const html = root.ownerDocument.documentElement;
    if (settings.theme === "system") html.removeAttribute("data-theme");
    else html.setAttribute("data-theme", settings.theme);
  };
  applyTheme();
  for (const section of sections) {
    const wrapper = root.ownerDocument.createElement("section");
    wrapper.id = `panel-${section.id}`;
    wrapper.setAttribute("role", "tabpanel");
    wrapper.dataset.section = section.id;
    sectionElements.set(section.id, wrapper);
    const heading = root.ownerDocument.createElement("h2");
    heading.textContent = section.title;
    wrapper.append(heading);
    root.append(wrapper);
    redraws.push(section.build({ root: wrapper, state: () => state, update, settings: () => settings, updateSettings, env }));
  }
  renderTabs();
  update(state);
  return { tick: () => {
    const existingToast = toast;
    update(rollEvent(tick(state), env.random(), env.random()));
    if (existingToast !== null && toast === existingToast) {
      toastTicks -= 1;
      if (toastTicks <= 0) { toast.remove(); toast = null; }
    }
  } };
}
