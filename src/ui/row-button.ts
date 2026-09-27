export function rowButton(document: Document, text: string, rowName: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = text;
  button.setAttribute("aria-label", `${text} ${rowName}`);
  return button;
}
