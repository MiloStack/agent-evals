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
export declare function getChecksForDomain(domain: string): Check[];
export { hasTests, noSecrets, noTodoFixme, fileSize, errorHandling, noInsecureHttp, noDisabledTls, noDangerousShell, noWeakCrypto, noWildcardCors, noInnerHtml, noSyncLoop, noNPlusOne, noMemoryLeak, noDomThrashing };
//# sourceMappingURL=index.d.ts.map