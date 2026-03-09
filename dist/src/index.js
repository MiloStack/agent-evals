export { parseInput } from "./parser.js";
export { getChecksForDomain } from "./checks/index.js";
export { generateReport, formatReportJson, formatReportPretty } from "./report.js";
import { parseInput } from "./parser.js";
import { getChecksForDomain } from "./checks/index.js";
import { generateReport } from "./report.js";
export async function evaluate(target, domain = "devops") {
    const input = parseInput(target);
    const checks = getChecksForDomain(domain);
    if (!checks.length)
        throw new Error(`No checks found for domain: ${domain}`);
    const results = await Promise.all(checks.map(c => c.run(input)));
    return generateReport(domain, input.files.length, results);
}
//# sourceMappingURL=index.js.map