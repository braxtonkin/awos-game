import type { GameState } from "../game.ts";
import type { PageEnv } from "../page.ts";

export type SectionContext = {
  root: HTMLElement;
  state(): GameState;
  update(next: GameState): void;
  env: PageEnv;
};

export type Section = {
  id: string;
  title: string;
  build(context: SectionContext): () => void;
};
