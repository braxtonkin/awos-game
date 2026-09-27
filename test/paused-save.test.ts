import { expect, test } from "vitest";
import { loadSave } from "../src/save.ts";

test("save decoding keeps each known paused upgrade once", () => {
  expect(loadSave('{"version":2,"savedAt":1,"state":{"amounts":{},"owned":{},"paused":["furnace","nope","furnace"]}}').state.paused).toEqual(["furnace"]);
});
