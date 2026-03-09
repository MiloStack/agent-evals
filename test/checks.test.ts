import { describe, it, expect } from "vitest";
import { hasTests } from "../src/checks/has-tests";
import { noSecrets } from "../src/checks/no-secrets";
import { noTodoFixme } from "../src/checks/no-todo-fixme";
import { fileSize } from "../src/checks/file-size";
import { errorHandling } from "../src/checks/error-handling";
import { noInsecureHttp } from "../src/checks/no-insecure-http";
import { noDisabledTls } from "../src/checks/no-disabled-tls";
import { noDangerousShell } from "../src/checks/no-dangerous-shell";
import { noWeakCrypto } from "../src/checks/no-weak-crypto";
import { noWildcardCors } from "../src/checks/no-wildcard-cors";
import { noInnerHtml } from "../src/checks/no-inner-html";
import { noSyncLoop } from "../src/checks/no-sync-loop";
import { noNPlusOne } from "../src/checks/no-n-plus-one";
import { noMemoryLeak } from "../src/checks/no-memory-leak";
import { noDomThrashing } from "../src/checks/no-dom-thrashing";
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

describe("no-insecure-http", () => {
  it("passes when only https", async () => {
    const r = await noInsecureHttp.run(mk([{path:"src/a.ts",content:"fetch(\"https://example.com\");"}]));
    expect(r.passed).toBe(true);
  });
  it("fails when http is used", async () => {
    const r = await noInsecureHttp.run(mk([{path:"src/a.ts",content:"fetch(\"http://example.com\");"}]));
    expect(r.passed).toBe(false);
  });
});

describe("no-disabled-tls", () => {
  it("passes when TLS is enforced", async () => {
    const r = await noDisabledTls.run(mk([{path:"src/http.ts",content:"httpsAgent: { rejectUnauthorized: true }"}]));
    expect(r.passed).toBe(true);
  });
  it("catches NODE_TLS_REJECT_UNAUTHORIZED=0", async () => {
    const r = await noDisabledTls.run(mk([{path:"src/unsafe.ts",content:"process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';"}]));
    expect(r.passed).toBe(false);
  });
  it("catches rejectUnauthorized:false", async () => {
    const r = await noDisabledTls.run(mk([{path:"src/unsafe.ts",content:"httpsAgent: { rejectUnauthorized: false }"}]));
    expect(r.passed).toBe(false);
  });
});

describe("no-dangerous-shell", () => {
  it("passes safe invocations", async () => {
    const r = await noDangerousShell.run(mk([{path:"src/a.ts",content:"child_process.exec(\"ls -la\");"}]));
    expect(r.passed).toBe(true);
  });
  it("catches concatenated commands", async () => {
    const r = await noDangerousShell.run(mk([{path:"src/a.ts",content:"child_process.exec(\"rm -rf \" + userInput);"}]));
    expect(r.passed).toBe(false);
  });
  it("catches template literals", async () => {
    const r = await noDangerousShell.run(mk([{path:"src/a.ts",content:"child_process.exec(`rm ${cmd}`);"}]));
    expect(r.passed).toBe(false);
  });
});

describe("no-weak-crypto", () => {
  it("passes strong hashes", async () => {
    const r = await noWeakCrypto.run(mk([{path:"src/crypto.ts",content:"crypto.createHash(\"sha256\");"}]));
    expect(r.passed).toBe(true);
  });
  it("catches md5 usage", async () => {
    const r = await noWeakCrypto.run(mk([{path:"src/crypto.ts",content:"crypto.createHash(\"md5\");"}]));
    expect(r.passed).toBe(false);
  });
  it("catches ECB mode", async () => {
    const r = await noWeakCrypto.run(mk([{path:"src/crypto.ts",content:"const cipher = crypto.createCipheriv(\"AES-128-ECB\", key, iv);"}]));
    expect(r.passed).toBe(false);
  });
});

describe("no-wildcard-cors", () => {
  it("passes strict CORS", async () => {
    const r = await noWildcardCors.run(mk([{path:"src/server.ts",content:"app.use(cors({ origin: \"https://example.com\" }));"}]));
    expect(r.passed).toBe(true);
  });
  it("catches cors(*)", async () => {
    const r = await noWildcardCors.run(mk([{path:"src/server.ts",content:"app.use(cors(\"*\"));"}]));
    expect(r.passed).toBe(false);
  });
  it("catches wildcard header", async () => {
    const r = await noWildcardCors.run(mk([{path:"src/server.ts",content:"res.setHeader(\"Access-Control-Allow-Origin\", \"*\");"}]));
    expect(r.passed).toBe(false);
  });
});

describe("no-inner-html", () => {
  it("passes when using textContent", async () => {
    const r = await noInnerHtml.run(mk([{path:"src/app.tsx",content:"element.textContent = userInput;"}]));
    expect(r.passed).toBe(true);
  });
  it("catches innerHTML assignment", async () => {
    const r = await noInnerHtml.run(mk([{path:"src/app.tsx",content:"element.innerHTML = userInput;"}]));
    expect(r.passed).toBe(false);
  });
  it("catches jQuery .html()", async () => {
    const r = await noInnerHtml.run(mk([{path:"src/app.js",content:"$('#div').html(userInput);"}]));
    expect(r.passed).toBe(false);
  });
});

describe("no-sync-loop", () => {
  it("passes async code", async () => {
    const r = await noSyncLoop.run(mk([{path:"src/api.ts",content:"const data = await fetch('/api');"}]));
    expect(r.passed).toBe(true);
  });
  it("catches sync file read in loop", async () => {
    const r = await noSyncLoop.run(mk([{path:"src/process.ts",content:"for (const f of files) { fs.readFileSync(f); }"}]));
    expect(r.passed).toBe(false);
  });
  it("catches forEach with execSync", async () => {
    const r = await noSyncLoop.run(mk([{path:"src/batch.ts",content:"files.forEach(f => execSync(f));"}]));
    expect(r.passed).toBe(false);
  });
});

describe("no-n-plus-one", () => {
  it("passes batch queries", async () => {
    const r = await noNPlusOne.run(mk([{path:"src/db/users.ts",content:"const users = await db.query('SELECT * FROM users');"}]));
    expect(r.passed).toBe(true);
  });
  it("catches query in loop", async () => {
    const r = await noNPlusOne.run(mk([{path:"src/db/users.ts",content:"for (const id of ids) { const user = await db.find(id); }"}]));
    expect(r.passed).toBe(false);
  });
  it("catches .map() with async queries", async () => {
    const r = await noNPlusOne.run(mk([{path:"src/db/users.ts",content:"const results = ids.map(id => db.find(id));"}]));
    expect(r.passed).toBe(false);
  });
});

describe("no-memory-leak", () => {
  it("passes with proper cleanup", async () => {
    const r = await noMemoryLeak.run(mk([{path:"src/stream.ts",content:"const stream = fs.createReadStream(f); stream.on('end', () => stream.close());"}]));
    expect(r.passed).toBe(true);
  });
  it("catches unclosed stream", async () => {
    const r = await noMemoryLeak.run(mk([{path:"src/stream.ts",content:"const stream = fs.createReadStream(f);"}]));
    expect(r.passed).toBe(false);
  });
  it("catches setInterval without clear", async () => {
    const r = await noMemoryLeak.run(mk([{path:"src/timer.ts",content:"setInterval(() => { }, 1000);"}]));
    expect(r.passed).toBe(false);
  });
  it("catches unclosed DB connection", async () => {
    const r = await noMemoryLeak.run(mk([{path:"src/db.ts",content:"const conn = await pool.connect();"}]));
    expect(r.passed).toBe(false);
  });
});

describe("no-dom-thrashing", () => {
  it("passes with cached elements", async () => {
    const r = await noDomThrashing.run(mk([{path:"src/app.tsx",content:"const el = document.querySelector('.x'); el.style.color = 'red';"}]));
    expect(r.passed).toBe(true);
  });
  it("catches DOM manipulation in loop", async () => {
    const r = await noDomThrashing.run(mk([{path:"src/app.tsx",content:"for (const item of items) { document.body.innerHTML += item; }"}]));
    expect(r.passed).toBe(false);
  });
});
