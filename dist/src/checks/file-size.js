const MAX_LINES = 500;
export const fileSize = {
    name: "file-size",
    domain: "devops",
    async run(input) {
        const findings = [];
        for (const file of input.files) {
            const lineCount = file.content.split("\n").length;
            if (lineCount > MAX_LINES) {
                findings.push({ file: file.path, message: `File has ${lineCount} lines (max: ${MAX_LINES}).`, severity: "warning" });
            }
        }
        const passed = findings.length === 0;
        return {
            check: "file-size", passed,
            score: passed ? 100 : Math.max(0, 100 - findings.length * 20),
            details: passed ? `All files under ${MAX_LINES} lines.` : `${findings.length} file(s) exceed ${MAX_LINES} lines.`,
            findings,
        };
    },
};
//# sourceMappingURL=file-size.js.map