const SECRET_PATTERNS = [
    { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/gi, label: "API key" },
    { pattern: /(?:secret|password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/gi, label: "password/secret" },
    { pattern: /(?:aws_access_key_id|aws_secret_access_key)\s*[:=]\s*["']?[A-Za-z0-9/+=]{16,}/gi, label: "AWS credential" },
    { pattern: /AKIA[0-9A-Z]{16}/g, label: "AWS access key ID" },
    { pattern: /ghp_[A-Za-z0-9]{36}/g, label: "GitHub personal access token" },
    { pattern: /sk-[A-Za-z0-9]{32,}/g, label: "OpenAI/Stripe secret key" },
    { pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g, label: "private key" },
    { pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, label: "JWT token" },
];
export const noSecrets = {
    name: "no-secrets",
    domain: "devops",
    critical: true,
    async run(input) {
        const findings = [];
        for (const file of input.files) {
            const lines = file.content.split("\n");
            for (let i = 0; i < lines.length; i++) {
                for (const { pattern, label } of SECRET_PATTERNS) {
                    pattern.lastIndex = 0;
                    if (pattern.test(lines[i])) {
                        findings.push({ file: file.path, line: i + 1, message: `Possible hardcoded ${label} detected.`, severity: "error" });
                    }
                }
            }
        }
        const passed = findings.length === 0;
        return {
            check: "no-secrets", passed,
            score: passed ? 100 : Math.max(0, 100 - findings.length * 25),
            details: passed ? "No hardcoded secrets detected." : `Found ${findings.length} potential secret(s).`,
            findings,
        };
    },
};
//# sourceMappingURL=no-secrets.js.map