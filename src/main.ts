import { tickMs } from "./game.ts";
import { mount } from "./page.ts";

const root = document.querySelector("main");
if (root === null) throw new Error("Missing main element");
const page = mount(root, { storage: localStorage, now: () => Date.now(), confirm: (message) => window.confirm(message) });
setInterval(() => page.tick(), tickMs);
