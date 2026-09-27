import type { GameState } from "../game.ts";
import type { PageEnv } from "../page.ts";
import type { Settings } from "../settings.ts";

export type SectionContext = {
  root: HTMLElement;
  state(): GameState;
  update(next: GameState): void;
  settings(): Settings;
  updateSettings(next: Settings): void;
  env: PageEnv;
};

export type Section = {
  id: string;
  title: string;
  build(context: SectionContext): () => void;
};
