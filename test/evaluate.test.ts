import { describe, it, expect } from "vitest";
import { evaluate } from "../src/index";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const mkProj = (files: Record<string,string>) => {
  const d = mkdtempSync(join(tmpdir(),"ae-test-"));
  for (const [n,c] of Object.entries(files)) { const p=join(d,n); mkdirSync(p.substring(0,p.lastIndexOf("/")),{recursive:true}); writeFileSync(p,c); }
  return d;
};

describe("evaluate", () => {
  it("passes clean project", async () => {
    const d = mkProj({"src/app.ts":"export const x=1;\n","test/app.test.ts":"it('ok',()=>{});\n"});
    const r = await evaluate(d,"devops");
    expect(r.passed).toBe(true);
    expect(r.checks.length).toBe(5);
  });
  it("fails on secrets", async () => {
    const d = mkProj({"src/c.ts":'const k="sk-1234567890abcdefghijklmnopqrstuv";\n'});
    const r = await evaluate(d,"devops");
    expect(r.passed).toBe(false);
  });
  it("throws for unknown domain", async () => {
    const d = mkProj({"a.ts":"x"});
    await expect(evaluate(d,"nope")).rejects.toThrow("No checks found");
  });
});
