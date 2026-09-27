export type Settings = { numbers: "short" | "full" | "scientific"; theme: "system" | "light" | "dark" };

export const defaultSettings: Settings = { numbers: "short", theme: "system" };
export const settingsKey = "awos-game:settings";

export function parseSettings(text: string | null): Settings {
  if (text === null) return { ...defaultSettings };
  try {
    const value: unknown = JSON.parse(text);
    if (typeof value !== "object" || value === null) return { ...defaultSettings };
    const source = value as Record<string, unknown>;
    return {
      numbers: source.numbers === "full" || source.numbers === "scientific" ? source.numbers : "short",
      theme: source.theme === "light" || source.theme === "dark" ? source.theme : "system",
    };
  } catch { return { ...defaultSettings }; }
}
