import { describe, it, expect } from "vitest";
import { add, subtract, multiply } from "./main";

describe("math functions", () => {
  it("should add two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("should subtract two numbers", () => {
    expect(subtract(5, 3)).toBe(2);
  });

  it("should multiply two numbers", () => {
    expect(multiply(2, 3)).toBe(6);
  });

  it("should throw on non-number inputs", () => {
    expect(() => multiply("a", 3)).toThrow();
  });
});
