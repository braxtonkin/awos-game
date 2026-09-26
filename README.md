# Block Idle

Block Idle is a small Minecraft-flavored idle game that runs in the browser. You click to mine resources, then spend them on upgrades that produce more every second. The game saves your progress in the browser's local storage. AutoWorker uses this repository as a target, and its agents turn the tickets in `tickets.json` into pull requests.

To run the game, install Node 24, run `npm ci` and then `npm run dev`, and open the address that Vite prints. `npm test` runs the tests, `npm run typecheck` checks the types, and `npm run build` writes the static site to `dist`. Each push to `main` deploys that site to GitHub Pages. Before the first deploy, set the repository's Pages source to GitHub Actions.
