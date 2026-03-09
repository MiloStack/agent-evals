/**
 * Main application entry point
 */

export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Error("Arguments must be numbers");
  }
  return a * b;
}
