export { parseInput } from "./parser";
export { Check, CheckResult, Finding, HasTestsCheck, NoSecretsCheck, NoTodoFixmeCheck, FileSizeCheck, ErrorHandlingCheck, getChecksForDomain, } from "./checks/index";
export { generateReport, formatReportJson, formatReportPretty, } from "./report";
export { parseCLIArgs } from "./cli";
// Main evaluation function
export async function evaluate(inputPath, domain = "devops") {
    const { parseInput } = await import("./parser");
    const { getChecksForDomain } = await import("./checks/index");
    const { generateReport } = await import("./report");
    const input = await parseInput(inputPath);
    const checks = getChecksForDomain(domain);
    if (checks.length === 0) {
        throw new Error(`No checks found for domain: ${domain}`);
    }
    const results = await Promise.all(checks.map((check) => check.run(input)));
    return generateReport(results, domain, input.files.length);
}
//# sourceMappingURL=index.js.map