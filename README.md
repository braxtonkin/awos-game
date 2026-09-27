# Block Idle

Block Idle is a Minecraft-inspired idle game. Mine resources by hand, buy upgrades and tools, and build machines that keep producing while you wait. Unlock zones with new resources, craft materials, and respond to events for boosts, trades, and rewards. Track achievements as you grow, then start new worlds to earn Emeralds and speed up future runs.

Play the game at [https://braxtonkin.github.io/awos-game/](https://braxtonkin.github.io/awos-game/).

## Development

Install Node 24, then run `npm ci` and `npm run dev` to start the local development server. Vite prints the address to open in your browser.

- `npm test` runs the test suite.
- `npm run sim` runs the progression simulator.
- `npm run smoke` runs the browser smoke check and needs Chrome installed.
- `npm run typecheck` checks TypeScript types.
- `npm run build` creates the static site in `dist`.

The site deploys to GitHub Pages on pushes to `main`. Set the repository's Pages source to GitHub Actions before the first deploy.
