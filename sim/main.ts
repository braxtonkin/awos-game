import { bounds } from "./bounds.ts";
import { script } from "./script.ts";
import { simulate } from "./simulate.ts";

declare const process: { argv: string[]; exitCode?: number };
const args = process.argv.slice(2);
let ticks = 3600;
let clicks = 2;
let until: string | undefined;
const expectations: { label: string; min: number; max: number }[] = [];
for (let index = 0; index < args.length; index += 1) {
  const option = args[index];
  const value = args[index + 1];
  if (option === "--ticks" && value !== undefined) { ticks = Number(value); index += 1; }
  else if (option === "--clicks" && value !== undefined) { clicks = Number(value); index += 1; }
  else if (option === "--until" && value !== undefined) { until = value; index += 1; }
  else if (option === "--expect" && value !== undefined) {
    const match = /^(.*)=(\d+)-(\d+)$/.exec(value);
    if (match) expectations.push({ label: match[1]!, min: Number(match[2]), max: Number(match[3]) });
    index += 1;
  }
}
const report = simulate({ ticks, clicksPerTick: clicks, script });
for (const item of report.reached) console.log(`${item.label} ${item.tick}`);
for (const label of report.unmet) console.log(`unmet ${label}`);
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
