const TEST_PATTERNS = [
    /\.test\.[jt]sx?$/,
    /\.spec\.[jt]sx?$/,
    /__tests__\//,
    /test\//,
    /_test\.(go|py|rb)$/,
    /tests?\.(py|rb)$/,
];
const SOURCE_EXTENSIONS = new Set([
    "typescript", "javascript", "python", "go", "rust", "ruby", "java",
]);
export const hasTests = {
    name: "has-tests",
    domain: "devops",
    async run(input) {
        const sourceFiles = input.files.filter((f) => SOURCE_EXTENSIONS.has(f.language) && !TEST_PATTERNS.some((p) => p.test(f.path)));
        const testFiles = input.files.filter((f) => TEST_PATTERNS.some((p) => p.test(f.path)));
        if (sourceFiles.length === 0) {
            return { check: "has-tests", passed: true, score: 100, details: "No source files to test.", findings: [] };
        }
        const ratio = testFiles.length / sourceFiles.length;
        const score = Math.min(100, Math.round(ratio * 100));
        const passed = testFiles.length > 0;
        return {
            check: "has-tests", passed, score,
            details: `${testFiles.length} test file(s) for ${sourceFiles.length} source file(s) (ratio: ${ratio.toFixed(2)}).`,
            findings: passed ? [] : [{ file: "", message: "No test files found in agent output.", severity: "warning" }],
        };
    },
};
//# sourceMappingURL=has-tests.js.map