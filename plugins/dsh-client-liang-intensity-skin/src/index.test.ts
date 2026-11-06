import { describe, expect, it } from "vitest";
import { parseSingleRange } from "./range.js";

describe("Liang media range parser", () => {
  it("accepts closed, open, and suffix ranges", () => {
    expect(parseSingleRange("bytes=10-19", 100)).toEqual({ start: 10, end: 19 });
    expect(parseSingleRange("bytes=90-", 100)).toEqual({ start: 90, end: 99 });
    expect(parseSingleRange("bytes=-10", 100)).toEqual({ start: 90, end: 99 });
  });

  it("rejects malformed, multi-part, and unsatisfiable ranges", () => {
    expect(parseSingleRange("bytes=0-1,4-5", 100)).toBe(false);
    expect(parseSingleRange("items=0-4", 100)).toBe(false);
    expect(parseSingleRange("bytes=100-", 100)).toBe(false);
    expect(parseSingleRange(undefined, 100)).toBe(null);
  });
});
