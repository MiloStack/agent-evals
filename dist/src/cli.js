#!/usr/bin/env node
import { evaluate } from "./index.js";
import { formatReportJson, formatReportPretty } from "./report.js";
async function main() {
    const args = process.argv.slice(2);
    if (!args.length || args.includes("--help") || args.includes("-h")) {
        console.log(`\n  agent-evals — evaluate AI coding agent outputs\n\n  Usage: agent-evals evaluate <path> [--domain devops|security] [--format pretty|json] [--strict]\n`);
        process.exit(0);
    }
    if (args[0] !== "evaluate") {
        console.error(`Unknown command: ${args[0]}`);
        process.exit(1);
    }
    const target = args[1];
    if (!target) {
        console.error("Missing path.");
        process.exit(1);
    }
    let domain = "devops", format = "pretty", strict = false;
    for (let i = 2; i < args.length; i++) {
        if (args[i] === "--domain" && args[i + 1])
            domain = args[++i];
        else if (args[i] === "--format" && args[i + 1])
            format = args[++i];
        else if (args[i] === "--strict")
            strict = true;
    }
    try {
        const report = await evaluate(target, domain);
        console.log(format === "json" ? formatReportJson(report) : formatReportPretty(report));
        if (strict && !report.passed)
            process.exit(1);
        if (report.checks.some(c => !c.passed && c.check === "no-secrets"))
            process.exit(1);
    }
    catch (e) {
        console.error(`Error: ${e.message}`);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=cli.js.map