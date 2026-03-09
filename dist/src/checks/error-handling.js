const BARE_CATCH_JS = /catch\s*\([^)]*\)\s*\{\s*\}/g;
const BARE_EXCEPT_PY = /except\s*:\s*(?:pass|\.\.\.)\s*$/gm;
const SWALLOWED_ERROR = /catch\s*\([^)]*\)\s*\{[^}]*(?:\/\/\s*ignore|\/\/\s*noop|\/\/\s*swallow)/gi;
const CODE_LANGUAGES = new Set(["typescript", "javascript", "python"]);
export const errorHandling = {
    name: "error-handling",
    domain: "devops",
    async run(input) {
        const findings = [];
        const codeFiles = input.files.filter((f) => CODE_LANGUAGES.has(f.language));
        if (codeFiles.length === 0) {
            return { check: "error-handling", passed: true, score: 100, details: "No code files to check.", findings: [] };
        }
        for (const file of codeFiles) {
            const fullContent = file.content;
            if (file.language === "typescript" || file.language === "javascript") {
                let match;
                BARE_CATCH_JS.lastIndex = 0;
                while ((match = BARE_CATCH_JS.exec(fullContent)) !== null) {
                    const line = fullContent.substring(0, match.index).split("\n").length;
                    findings.push({ file: file.path, line, message: "Empty catch block — errors are silently swallowed.", severity: "error" });
                }
                SWALLOWED_ERROR.lastIndex = 0;
                while ((match = SWALLOWED_ERROR.exec(fullContent)) !== null) {
                    const line = fullContent.substring(0, match.index).split("\n").length;
                    findings.push({ file: file.path, line, message: "Catch block intentionally swallows error.", severity: "warning" });
                }
            }
            if (file.language === "python") {
                const lines = file.content.split("\n");
                for (let i = 0; i < lines.length; i++) {
                    BARE_EXCEPT_PY.lastIndex = 0;
                    if (BARE_EXCEPT_PY.test(lines[i])) {
                        findings.push({ file: file.path, line: i + 1, message: "Bare 'except: pass' swallows all errors.", severity: "error" });
                    }
                }
            }
        }
        const passed = findings.filter((f) => f.severity === "error").length === 0;
        const score = Math.max(0, 100 - findings.length * 15);
        return {
            check: "error-handling", passed, score,
            details: passed ? "No error-handling anti-patterns found." : `Found ${findings.length} error-handling issue(s).`,
            findings,
        };
    },
};
//# sourceMappingURL=error-handling.js.map