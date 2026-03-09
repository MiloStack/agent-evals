export { Check, CheckResult, Finding } from "./types";
export { HasTestsCheck, NoSecretsCheck, NoTodoFixmeCheck, FileSizeCheck, ErrorHandlingCheck, } from "./devops";
import { HasTestsCheck, NoSecretsCheck, NoTodoFixmeCheck, FileSizeCheck, ErrorHandlingCheck, } from "./devops";
const devopsChecks = [
    new HasTestsCheck(),
    new NoSecretsCheck(),
    new NoTodoFixmeCheck(),
    new FileSizeCheck(),
    new ErrorHandlingCheck(),
];
export function getChecksForDomain(domain) {
    if (domain === "devops") {
        return devopsChecks;
    }
    throw new Error(`Unknown domain: ${domain}`);
}
//# sourceMappingURL=index.js.map