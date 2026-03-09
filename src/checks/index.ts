import type { Check } from "../types.js";
import { hasTests } from "./has-tests.js";
import { noSecrets } from "./no-secrets.js";
import { noTodoFixme } from "./no-todo-fixme.js";
import { fileSize } from "./file-size.js";
import { errorHandling } from "./error-handling.js";
import { noInsecureHttp } from "./no-insecure-http.js";
import { noDisabledTls } from "./no-disabled-tls.js";
import { noDangerousShell } from "./no-dangerous-shell.js";
import { noWeakCrypto } from "./no-weak-crypto.js";
import { noWildcardCors } from "./no-wildcard-cors.js";
import { noInnerHtml } from "./no-inner-html.js";
import { noSyncLoop } from "./no-sync-loop.js";
import { noNPlusOne } from "./no-n-plus-one.js";
import { noMemoryLeak } from "./no-memory-leak.js";
import { noDomThrashing } from "./no-dom-thrashing.js";

// DevOps checks (testing, secrets, code quality)
const DEVOPS: Check[] = [
  hasTests,
  noSecrets,
  noTodoFixme,
  fileSize,
  errorHandling,
];

// Security checks
const SECURITY: Check[] = [
  noInsecureHttp,
  noDisabledTls,
  noDangerousShell,
  noWeakCrypto,
  noWildcardCors,
];

// Performance checks
const PERFORMANCE: Check[] = [
  noInnerHtml,
  noSyncLoop,
  noNPlusOne,
  noMemoryLeak,
  noDomThrashing,
];

const ALL: Check[] = [...DEVOPS, ...SECURITY, ...PERFORMANCE];

export function getChecksForDomain(domain: string): Check[] {
  switch (domain) {
    case "devops":
      return DEVOPS;
    case "security":
      return SECURITY;
    case "performance":
      return PERFORMANCE;
    default:
      return ALL.filter(c => c.domain === domain);
  }
}

export { hasTests, noSecrets, noTodoFixme, fileSize, errorHandling,
  noInsecureHttp, noDisabledTls, noDangerousShell, noWeakCrypto, noWildcardCors,
  noInnerHtml, noSyncLoop, noNPlusOne, noMemoryLeak, noDomThrashing };
