const TEST_RE = [/\.test\.[jt]sx?$/, /\.spec\.[jt]sx?$/, /__tests__\//, /test\//, /_test\.(go|py|rb)$/];
const SRC_LANGS = new Set(["typescript", "javascript", "python", "go", "rust", "ruby", "java"]);
export const hasTests = {
    name: "has-tests", domain: "devops",
    async run(input) {
        const src = input.files.filter(f => SRC_LANGS.has(f.language) && !TEST_RE.some(r => r.test(f.path)));
        const tst = input.files.filter(f => TEST_RE.some(r => r.test(f.path)));
        if (!src.length)
            return { check: "has-tests", passed: true, score: 100, details: "No source files.", findings: [] };
        const ratio = tst.length / src.length;
        const passed = tst.length > 0;
        return { check: "has-tests", passed, score: Math.min(100, Math.round(ratio * 100)),
            details: `${tst.length} test(s) for ${src.length} source file(s).`,
            findings: passed ? [] : [{ file: "", message: "No test files found.", severity: "warning" }] };
    },
};
//# sourceMappingURL=has-tests.js.map