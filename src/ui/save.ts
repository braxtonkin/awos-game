import { decodeSave, serialize } from "../save.ts";
import type { Section } from "./section.ts";

export const saveSection: Section = {
  id: "save",
  title: "Save",
  build({ root, state, update, env }) {
    const document = root.ownerDocument;
    const exportText = document.createElement("textarea");
    exportText.dataset.export = "";
    exportText.readOnly = true;
    const exportButton = document.createElement("button");
    exportButton.textContent = "Export";
    exportButton.addEventListener("click", () => {
      exportText.value = serialize(state(), env.now());
    });
    const importText = document.createElement("textarea");
    importText.dataset.import = "";
    const importButton = document.createElement("button");
    importButton.textContent = "Import";
    const message = document.createElement("p");
    message.className = "message";
    importButton.addEventListener("click", () => {
      const decoded = decodeSave(importText.value);
      if (decoded.kind === "invalid") {
        message.textContent = decoded.reason;
        return;
      }
      if (env.confirm("Replace your current game with this save?")) {
        update(decoded.state);
        message.textContent = "Save imported.";
      }
    });
    root.append(exportButton, exportText, importText, importButton, message);
    return () => {};
  },
};
