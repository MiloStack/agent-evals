export function generateReport(domain, inputFiles, results) {
    const total = results.reduce((s, r) => s + r.score, 0);
    const overallScore = results.length ? Math.round(total / results.length) : 100;
    return { timestamp: new Date().toISOString(), domain, inputFiles, checks: results, overallScore, passed: results.every(r => r.passed) };
}
export function formatReportJson(report) { return JSON.stringify(report, null, 2); }
export function formatReportPretty(report) {
    const l = ["", `  agent-evals report`,
        `  Domain: ${report.domain} | Files: ${report.inputFiles} | Score: ${report.overallScore}/100`,
        `  Result: ${report.passed ? "✅ PASSED" : "❌ FAILED"}`, ""];
    for (const c of report.checks) {
        l.push(`  ${c.passed ? "✅" : "❌"} ${c.check} (${c.score}/100)`);
        l.push(`     ${c.details}`);
        for (const f of c.findings) {
            const loc = f.line ? `${f.file}:${f.line}` : f.file || "(project)";
            l.push(`     ${f.severity === "error" ? "🔴" : "🟡"} ${loc}: ${f.message}`);
        }
    }
    l.push("");
    return l.join("\n");
}
//# sourceMappingURL=report.js.map