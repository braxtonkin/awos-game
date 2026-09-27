import type { Section } from "./section.ts";

const paragraphs = [
  "Click Mine to gather a resource by hand. Better pickaxes mine more with every click.",
  "Machines turn resources into steady production. Build them to keep gathering while you wait.",
  "Craft resources into useful items and materials for stronger tools and machines.",
  "Unlock zones to discover new resources and expand what you can mine and build.",
  "Watch for events that offer temporary boosts, trades, and rewards.",
  "Once a world has gathered 100K resources, start a new world for Emeralds. Each Emerald makes the next world 10% faster.",
];

export const helpSection: Section = {
  id: "help",
  title: "How to play",
  build({ root }) {
    for (const content of paragraphs) {
      const paragraph = root.ownerDocument.createElement("p");
      paragraph.textContent = content;
      root.append(paragraph);
    }
    return () => {};
  },
};
