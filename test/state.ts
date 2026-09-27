import { initialState, type GameState } from "../src/game.ts";

export function stateWith(parts: Partial<GameState>): GameState {
  return { ...initialState, ...parts };
}
