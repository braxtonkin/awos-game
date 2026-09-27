import { defineConfig } from "vitest/config";

export default defineConfig({ base: "./", test: { environment: "happy-dom", maxWorkers: 2, testTimeout: 120_000 } });
