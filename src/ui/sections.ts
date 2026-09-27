import type { Section } from "./section.ts";
import { resourcesSection } from "./resources.ts";
import { upgradesSection } from "./upgrades.ts";
import { resetSection } from "./reset.ts";
import { saveSection } from "./save.ts";

export const sections: readonly Section[] = [
  resourcesSection,
  upgradesSection,
  saveSection,
  resetSection,
];
