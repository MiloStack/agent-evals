import type { Check, CheckResult, EvalInput, Finding } from "../types.js";
const RULES: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*["']?0["']?/g, message: "NODE_TLS_REJECT_UNAUTHORIZED=0 disables TLS verification." },
  { pattern: /rejectUnauthorized\s*:\s*(?:false|0)/g, message: "rejectUnauthorized:false turns off TLS verification." },
  { pattern: /strictSSL\s*:\s*(?:false|0)/g, message: "strictSSL:false allows insecure TLS connections." },
];
export const noDisabledTls: Check = {
  name: "no-disabled-tls", domain: "security",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];
    for (const file of input.files) {
      const lines = file.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        for (const { pattern, message } of RULES) {
          pattern.lastIndex = 0;
          if (pattern.test(lines[i])) {
            findings.push({ file: file.path, line: i + 1, message, severity: "error" });
          }
        }
      }
    }
    const passed = findings.length === 0;
    return {
      check: "no-disabled-tls",
      passed,
      score: passed ? 100 : Math.max(0, 100 - findings.length * 20),
      details: passed ? "TLS verification appears enforced." : `Found ${findings.length} TLS override(s).`,
      findings,
    };
  },
};
