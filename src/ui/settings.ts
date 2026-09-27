import type { Section } from "./section.ts";

export const settingsSection: Section = {
  id: "settings",
  title: "Settings",
  build({ root, settings, updateSettings }) {
    const document = root.ownerDocument;
    const fields = [
      { key: "numbers", label: "Numbers", values: [["short", "Short (1.2K)"], ["full", "Full (1,234)"], ["scientific", "Scientific (1.23e3)"]] },
      { key: "theme", label: "Theme", values: [["system", "System"], ["light", "Light"], ["dark", "Dark"]] },
    ] as const;
    const selects = fields.map(({ key, label, values }) => {
      const wrapper = document.createElement("p");
      const fieldLabel = document.createElement("label");
      fieldLabel.textContent = `${label} `;
      const select = document.createElement("select");
      select.setAttribute("aria-label", label);
      for (const [value, text] of values) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        select.append(option);
      }
      select.addEventListener("change", () => updateSettings({ ...settings(), [key]: select.value }));
      fieldLabel.append(select);
      wrapper.append(fieldLabel);
      root.append(wrapper);
      return { key, select };
    });
    return () => selects.forEach(({ key, select }) => { select.value = settings()[key]; });
  },
};
