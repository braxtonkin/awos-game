# Rules for agents

Agents extend this game through small tickets, and several branches often change the same files at once. Follow these rules so each change stays small and its conflicts stay easy to resolve.

- Before you finish, run `npm run typecheck`, `npm test`, and `npm run build`. All three must pass.
- Add a new resource to the end of the `resources` array in `src/resources.ts`. Add a new upgrade to the end of the `upgrades` array in `src/upgrades.ts`.
- Append new tools, zones, and recipes to the end of their arrays in src/tools.ts, src/zones.ts, and src/recipes.ts. Their ids are save keys too.
- Treat every resource and upgrade id as a save key. Write it in camelCase, and never rename one.
- Keep game rules in `src/game.ts` and out of `src/main.ts`. Build the text for amounts and upgrades in `src/format.ts`. Both files hold pure functions. `src/main.ts` only builds the page, runs the tick loop, and saves.
- Add a test in `test/` for every rule change and every text change. Call the function and compare the result with a literal expected value.
- If two branches both append to the same array or test file, resolve the merge conflict by keeping main's additions first, then yours, each once.
- Add no runtime dependencies.
- Write no code comments, except one that explains a why the code cannot show.
- Each page section lives in its own file under src/ui/ and is listed once in src/ui/sections.ts. Page code reads the clock, storage, and dialogs only through PageEnv. Every UI change adds a DOM test that uses openPage from test/page.ts.
- A ticket that adds something to buy adds the goals and bounds it names to sim/script.ts and sim/bounds.ts. npm test fails when a goal becomes unreachable or a bound is missed.
A change that renames or restructures saved data raises currentSaveVersion, adds a migration, and adds a fixture under test/fixtures/saves/. A change that only adds a field needs none of these, because the decoder gives a missing field its initial value.
