import type { Section } from "./section.ts";
import { resourcesSection } from "./resources.ts";
import { toolsSection } from "./tools.ts";
import { zonesSection } from "./zones.ts";
import { upgradesSection } from "./upgrades.ts";
import { craftingSection } from "./crafting.ts";
import { resetSection } from "./reset.ts";
import { statsSection } from "./stats.ts";
import { saveSection } from "./save.ts";
import { eventSection } from "./event.ts";
import { achievementsSection } from "./achievements.ts";
import { newWorldSection } from "./new-world.ts";

export const sections: readonly Section[] = [
  eventSection,
  resourcesSection,
  toolsSection,
  zonesSection,
  upgradesSection,
  craftingSection,
  statsSection,
  achievementsSection,
  newWorldSection,
  saveSection,
  resetSection,
];
