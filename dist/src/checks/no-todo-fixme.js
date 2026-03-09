const TODO_PATTERN = /\b(TODO|FIXME|HACK|XXX)\b/gi;
export const noTodoFixme = {
    name: "no-todo-fixme",
    domain: "devops",
    async run(input) {
        const findings = [];
        for (const file of input.files) {
            const lines = file.content.split("\n");
            for (let i = 0; i < lines.length; i++) {
                const matches = lines[i].match(TODO_PATTERN);
                if (matches) {
                    findings.push({ file: file.path, line: i + 1, message: `Unresolved ${matches[0].toUpperCase()} comment.`, severity: "warning" });
                }
            }
        }
        const passed = findings.length === 0;
        return {
            check: "no-todo-fixme", passed,
            score: passed ? 100 : Math.max(0, 100 - findings.length * 10),
            details: passed ? "No unresolved TODO/FIXME/HACK/XXX comments." : `Found ${findings.length} unresolved comment(s).`,
            findings,
        };
    },
};
//# sourceMappingURL=no-todo-fixme.js.map