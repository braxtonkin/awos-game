import type { Section } from "./section.ts";
import { resourcesSection } from "./resources.ts";
import { toolsSection } from "./tools.ts";
import { upgradesSection } from "./upgrades.ts";
import { resetSection } from "./reset.ts";
import { zonesSection } from "./zones.ts";

export const sections: readonly Section[] = [
  resourcesSection,
  toolsSection,
  zonesSection,
  upgradesSection,
  resetSection,
];
