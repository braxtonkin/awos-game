import type { Section } from "./section.ts";
import { resourcesSection } from "./resources.ts";
import { upgradesSection } from "./upgrades.ts";
import { resetSection } from "./reset.ts";
import { statsSection } from "./stats.ts";

export const sections: readonly Section[] = [
  resourcesSection,
  upgradesSection,
  statsSection,
  resetSection,
];
