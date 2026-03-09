import { describe, it, expect } from "vitest";
import { hasTests } from "../src/checks/has-tests";
import { noSecrets } from "../src/checks/no-secrets";
import { noTodoFixme } from "../src/checks/no-todo-fixme";
import { fileSize } from "../src/checks/file-size";
import { errorHandling } from "../src/checks/error-handling";
import type { EvalInput } from "../src/types";

const mk = (files: Array<{path:string;content:string;language?:string}>): EvalInput => ({
  files: files.map(f => ({path:f.path, content:f.content, language:f.language??"typescript"}))
});

describe("has-tests", () => {
  it("passes when tests exist", async () => {
    const r = await hasTests.run(mk([{path:"src/a.ts",content:"x"},{path:"test/a.test.ts",content:"t"}]));
    expect(r.passed).toBe(true);
  });
  it("fails when no tests", async () => {
    const r = await hasTests.run(mk([{path:"src/a.ts",content:"x"}]));
    expect(r.passed).toBe(false);
  });
});

describe("no-secrets", () => {
  it("passes clean code", async () => {
    const r = await noSecrets.run(mk([{path:"a.ts",content:'const x = "hello";'}]));
    expect(r.passed).toBe(true);
  });
  it("catches AWS key", async () => {
    const r = await noSecrets.run(mk([{path:"a.ts",content:'const k = "AKIAIOSFODNN7EXAMPLE";'}]));
    expect(r.passed).toBe(false);
  });
  it("catches ghp token", async () => {
    const r = await noSecrets.run(mk([{path:"a.ts",content:'const t = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";'}]));
    expect(r.passed).toBe(false);
  });
});

describe("no-todo-fixme", () => {
  it("passes clean code", async () => {
    const r = await noTodoFixme.run(mk([{path:"a.ts",content:"const x = 1;"}]));
    expect(r.passed).toBe(true);
  });
  it("catches TODO", async () => {
    const r = await noTodoFixme.run(mk([{path:"a.ts",content:"// TODO: fix"}]));
    expect(r.passed).toBe(false);
  });
});

describe("file-size", () => {
  it("passes small files", async () => {
    const r = await fileSize.run(mk([{path:"a.ts",content:"x\n".repeat(100)}]));
    expect(r.passed).toBe(true);
  });
  it("fails large files", async () => {
    const r = await fileSize.run(mk([{path:"a.ts",content:"x\n".repeat(600)}]));
    expect(r.passed).toBe(false);
  });
});

describe("error-handling", () => {
  it("passes proper handling", async () => {
    const r = await errorHandling.run(mk([{path:"a.ts",content:"try { x(); } catch(e) { console.error(e); }"}]));
    expect(r.passed).toBe(true);
  });
  it("catches empty catch", async () => {
    const r = await errorHandling.run(mk([{path:"a.ts",content:"try { x(); } catch(e) {}"}]));
    expect(r.passed).toBe(false);
  });
  it("catches bare except in Python", async () => {
    const r = await errorHandling.run(mk([{path:"a.py",content:"try:\n  x()\nexcept: pass",language:"python"}]));
    expect(r.passed).toBe(false);
  });
});
