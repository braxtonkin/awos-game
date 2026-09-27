# Rules for agents

Agents extend this game through small tickets, and several branches often change the same files at once. Follow these rules so each change stays small and its conflicts stay easy to resolve.

- Before you finish, run `npm run typecheck`, `npm test`, and `npm run build`. All three must pass.
- Add a new resource to the end of the `resources` array in `src/resources.ts`. Add a new upgrade to the end of the `upgrades` array in `src/upgrades.ts`.
- Treat every resource and upgrade id as a save key. Write it in camelCase, and never rename one.
- Keep game rules in `src/game.ts` and out of `src/main.ts`. Build the text for amounts and upgrades in `src/format.ts`. Both files hold pure functions. `src/main.ts` only builds the page, runs the tick loop, and saves.
- Add a test in `test/` for every rule change and every text change. Call the function and compare the result with a literal expected value.
- If two branches both append to the same array or test file, resolve the merge conflict by keeping main's additions first, then yours, each once.
- Add no runtime dependencies.
- Write no code comments, except one that explains a why the code cannot show.
- Build every test state with stateWith from test/state.ts, and assert only the fields the test checks.
- Put each feature's tests in their own file, test/<feature>.test.ts, so parallel branches add files instead of editing one.
