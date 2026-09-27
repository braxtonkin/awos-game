import { mount } from "../src/page.ts";
import type { Page, PageEnv } from "../src/page.ts";

export function openPage(save?: string, env: Partial<PageEnv> = {}): {
  page: Page;
  storage: Pick<Storage, "getItem" | "setItem">;
} {
  document.body.replaceChildren();
  const root = document.createElement("main");
  document.body.append(root);
  const values = new Map<string, string>();
  if (save !== undefined) values.set("awos-game:save", save);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  const page = mount(root, {
    storage,
    now: env.now ?? (() => 1_000_000),
    confirm: env.confirm ?? (() => true),
    random: env.random ?? (() => 0.5),
  });
  return { page, storage };
}
