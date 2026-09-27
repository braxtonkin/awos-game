import { expect, test } from "vitest";
import { formatAmount } from "../src/format.ts";

test("formatAmount floors fractional amounts below one thousand", () => {
  expect(formatAmount(2.7)).toBe("2");
  expect(formatAmount(0.4)).toBe("0");
  expect(formatAmount(999.9)).toBe("999");
});

test("formatAmount supports suffixes through decillion", () => {
  expect(formatAmount(1500000000000)).toBe("1.5T");
  expect(formatAmount(2e15)).toBe("2Qa");
  expect(formatAmount(3.45e33)).toBe("3.4Dc");
  expect(formatAmount(9.99e35)).toBe("999Dc");
});

test("formatAmount uses scientific notation from 1e36", () => {
  expect(formatAmount(1e36)).toBe("1e36");
  expect(formatAmount(1.2e36)).toBe("1.2e36");
  expect(formatAmount(4.56e40)).toBe("4.5e40");
});

test("formatAmount preserves existing K, M, and B formatting", () => {
  expect(formatAmount(1000)).toBe("1K");
  expect(formatAmount(1234)).toBe("1.2K");
  expect(formatAmount(999999)).toBe("999.9K");
  expect(formatAmount(1500000)).toBe("1.5M");
  expect(formatAmount(2000000000)).toBe("2B");
});
