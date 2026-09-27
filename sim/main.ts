import { bounds } from "./bounds.ts";
import { script } from "./script.ts";
import { simulate } from "./simulate.ts";
import { readFileSync, writeFileSync } from "node:fs";
import { decodeSave, serialize } from "../src/save.ts";
import { resources } from "../src/resources.ts";
import { upgrades } from "../src/upgrades.ts";
import { tools } from "../src/tools.ts";
import { zones } from "../src/zones.ts";

declare const process: { argv: string[]; exitCode?: number };
const args = process.argv.slice(2);
let ticks = 3600;
let clicks = 2;
let until: string | undefined;
let savePath: string | undefined;
let checkSavePath: string | undefined;
const expectations: { label: string; min: number; max: number }[] = [];
for (let index = 0; index < args.length; index += 1) {
  const option = args[index];
  const value = args[index + 1];
  if (option === "--ticks" && value !== undefined) { ticks = Number(value); index += 1; }
  else if (option === "--clicks" && value !== undefined) { clicks = Number(value); index += 1; }
  else if (option === "--until" && value !== undefined) { until = value; index += 1; }
  else if (option === "--save" && value !== undefined) { savePath = value; index += 1; }
  else if (option === "--check-save" && value !== undefined) { checkSavePath = value; index += 1; }
  else if (option === "--expect" && value !== undefined) {
    const match = /^(.*)=(\d+)-(\d+)$/.exec(value);
    if (match) expectations.push({ label: match[1]!, min: Number(match[2]), max: Number(match[3]) });
    index += 1;
  }
}
if (checkSavePath !== undefined) {
  const text = readFileSync(checkSavePath, "utf8");
  const decoded = decodeSave(text);
  if (decoded.kind === "invalid") {
    console.log(`FAIL ${decoded.reason}`);
    process.exitCode = 1;
  } else {
    const parsed = JSON.parse(text) as { state?: { amounts?: Record<string, unknown>; owned?: Record<string, unknown> } };
    const state = parsed.state ?? {};
    const amountIds = resources.map((item) => item.id);
    const purchaseIds = [...upgrades, ...tools, ...zones].map((item) => item.id);
    const mismatch = [...amountIds.filter((id) => Object.hasOwn(state.amounts ?? {}, id) && state.amounts?.[id] !== decoded.state.amounts[id]),
      ...purchaseIds.filter((id) => Object.hasOwn(state.owned ?? {}, id) && state.owned?.[id] !== decoded.state.owned[id])][0];
    if (mismatch !== undefined) {
      console.log(`FAIL ${mismatch} changed while loading`);
      process.exitCode = 1;
    } else console.log(`ok version ${decoded.version}`);
  }
} else {
const report = simulate({ ticks, clicksPerTick: clicks, script });
for (const item of report.reached) console.log(`${item.label} ${item.tick}`);
for (const label of report.unmet) console.log(`unmet ${label}`);
if (savePath !== undefined) writeFileSync(savePath, serialize(report.state, 1700000000000));
let failed = until !== undefined && !report.reached.some((item) => item.label === until);
for (const expectation of expectations) {
  const item = report.reached.find((candidate) => candidate.label === expectation.label);
  if (item === undefined) {
    console.log(`FAIL ${expectation.label} not reached`);
    failed = true;
  } else if (item.tick < expectation.min || item.tick > expectation.max) {
    console.log(`FAIL ${expectation.label} reached at ${item.tick}, expected ${expectation.min}-${expectation.max}`);
    failed = true;
  }
}
void bounds;
if (failed) process.exitCode = 1;
}
