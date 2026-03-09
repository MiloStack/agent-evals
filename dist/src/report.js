export function generateReport(checks, domain, inputFileCount) {
    const criticalChecks = ["no-secrets"];
    const noCriticalFailures = checks
        .filter((c) => criticalChecks.includes(c.check))
        .every((c) => c.passed);
    const overallScore = checks.length > 0
        ? checks.reduce((sum, c) => sum + c.score, 0) / checks.length
        : 0;
    return {
        timestamp: new Date().toISOString(),
        domain,
        inputFiles: inputFileCount,
        checks,
        overallScore: Math.round(overallScore * 100) / 100,
        passed: noCriticalFailures,
    };
}
export function formatReportJson(report) {
    return JSON.stringify(report, null, 2);
}
export function formatReportPretty(report) {
    const status = report.passed ? "✅ PASSED" : "❌ FAILED";
    const lines = [];
    lines.push("");
    lines.push("═════════════════════════════════════════════════════════════");
    lines.push(`  Agent Eval Report [${report.domain}]`);
    lines.push("═════════════════════════════════════════════════════════════");
    lines.push("");
    lines.push(`  Status:         ${status}`);
    lines.push(`  Overall Score:  ${report.overallScore.toFixed(1)}/100`);
    lines.push(`  Input Files:    ${report.inputFiles}`);
    lines.push(`  Timestamp:      ${new Date(report.timestamp).toLocaleString()}`);
    lines.push("");
    lines.push("  Check Results:");
    lines.push("  ─────────────────────────────────────────────────────────────");
    for (const check of report.checks) {
        const checkStatus = check.passed ? "✓" : "✗";
        lines.push(`  ${checkStatus} ${check.check.padEnd(20)} ${check.score.toFixed(0).padStart(3)}/100`);
        lines.push(`    ${check.details}`);
        if (check.findings.length > 0) {
            lines.push(`    Findings:`);
            for (const finding of check.findings) {
                const location = finding.line
                    ? `${finding.file}:${finding.line}`
                    : finding.file;
                lines.push(`      • ${location}: ${finding.message}`);
                if (finding.details) {
                    lines.push(`        ${finding.details}`);
                }
            }
        }
        lines.push("");
    }
    lines.push("═════════════════════════════════════════════════════════════");
    lines.push("");
    return lines.join("\n");
}
//# sourceMappingURL=report.js.map