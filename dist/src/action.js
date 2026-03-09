import { evaluate } from "./index.js";
import { formatReportPretty } from "./report.js";
const SUPPORTED_DOMAINS = ["devops", "security", "performance"];
const TRUTHY_VALUES = new Set(["true", "1", "yes", "on"]);
function getInput(name, fallback) {
    const value = process.env[`INPUT_${name.replace(/[^A-Z0-9]/gi, "_").toUpperCase()}`];
    return value === undefined || value.trim() === "" ? fallback : value.trim();
}
async function main() {
    const targetPath = getInput("path", ".");
    let domain = getInput("domain", "devops").toLowerCase();
    if (!SUPPORTED_DOMAINS.includes(domain)) {
        console.warn(`Unsupported domain '${domain}', falling back to 'devops'. Supported domains: ${SUPPORTED_DOMAINS.join(", ")}`);
        domain = "devops";
    }
    const strict = TRUTHY_VALUES.has(getInput("strict", "false").toLowerCase());
    console.log(`Running agent-evals for '${domain}' checks against '${targetPath}'`);
    try {
        const report = await evaluate(targetPath, domain);
        console.log(formatReportPretty(report));
        const noSecretsFailed = report.checks.some((check) => check.check === "no-secrets" && !check.passed);
        if (noSecretsFailed) {
            console.error("no-secrets check failed; failing workflow to keep secrets out of your repo.");
            process.exit(1);
        }
        if (strict && !report.passed) {
            console.error("Strict mode enabled and evaluation failed; failing workflow.");
            process.exit(1);
        }
    }
    catch (error) {
        console.error("agent-evals action failed:", error.message);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=action.js.map