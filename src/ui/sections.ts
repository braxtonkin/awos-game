import type { Section } from "./section.ts";
import { resourcesSection } from "./resources.ts";
import { toolsSection } from "./tools.ts";
import { upgradesSection } from "./upgrades.ts";
import { craftingSection } from "./crafting.ts";
import { resetSection } from "./reset.ts";

export const sections: readonly Section[] = [
  resourcesSection,
  toolsSection,
  upgradesSection,
  craftingSection,
  resetSection,
];
