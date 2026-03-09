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
const ALL = [
    hasTests,
    noSecrets,
    noTodoFixme,
    fileSize,
    errorHandling,
    noInsecureHttp,
    noDisabledTls,
    noDangerousShell,
    noWeakCrypto,
    noWildcardCors,
];
export function getChecksForDomain(domain) {
    return ALL.filter(c => c.domain === domain);
}
export { hasTests, noSecrets, noTodoFixme, fileSize, errorHandling, noInsecureHttp, noDisabledTls, noDangerousShell, noWeakCrypto, noWildcardCors };
//# sourceMappingURL=index.js.map