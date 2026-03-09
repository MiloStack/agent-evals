#!/usr/bin/env node
import { evaluate } from "./index.js";
import { formatReportJson, formatReportPretty } from "./report.js";
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
        console.log(`
  agent-evals — evaluate AI coding agent outputs

  Usage:
    agent-evals evaluate <path> [options]

  Options:
    --domain <name>    Domain to evaluate against (default: devops)
    --format <type>    Output format: pretty | json (default: pretty)
    --strict           Exit 1 if any check fails
    -h, --help         Show this help
`);
        process.exit(0);
    }
    const command = args[0];
    if (command !== "evaluate") {
        console.error(`Unknown command: ${command}. Use "evaluate".`);
        process.exit(1);
    }
    const target = args[1];
    if (!target) {
        console.error("Missing target path. Usage: agent-evals evaluate <path>");
        process.exit(1);
    }
    let domain = "devops";
    let format = "pretty";
    let strict = false;
    for (let i = 2; i < args.length; i++) {
        if (args[i] === "--domain" && args[i + 1]) {
            domain = args[++i];
        }
        else if (args[i] === "--format" && args[i + 1]) {
            format = args[++i];
        }
        else if (args[i] === "--strict") {
            strict = true;
        }
    }
    try {
        const report = await evaluate(target, domain);
        const output = format === "json" ? formatReportJson(report) : formatReportPretty(report);
        console.log(output);
        if (strict && !report.passed) {
            process.exit(1);
        }
        const criticalFailed = report.checks.some((c) => !c.passed && c.check === "no-secrets");
        if (criticalFailed) {
            process.exit(1);
        }
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=cli.js.map