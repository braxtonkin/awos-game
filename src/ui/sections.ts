import type { Section } from "./section.ts";
import { resourcesSection } from "./resources.ts";
import { toolsSection } from "./tools.ts";
import { zonesSection } from "./zones.ts";
import { upgradesSection } from "./upgrades.ts";
import { statsSection } from "./stats.ts";
import { saveSection } from "./save.ts";
import { resetSection } from "./reset.ts";

export const sections: readonly Section[] = [
  resourcesSection,
  toolsSection,
  zonesSection,
  upgradesSection,
  statsSection,
  saveSection,
  resetSection,
];
