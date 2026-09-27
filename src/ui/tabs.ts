export const tabs = [
  { id: "mine", label: "Mine", sections: ["event", "resources", "tools", "zones"] },
  { id: "build", label: "Build", sections: ["upgrades", "crafting"] },
  { id: "progress", label: "Progress", sections: ["achievements", "stats"] },
  { id: "more", label: "More", sections: ["newWorld", "settings", "help", "save", "reset"] },
] as const;
