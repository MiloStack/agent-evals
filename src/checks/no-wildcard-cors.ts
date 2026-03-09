import type { Check, CheckResult, EvalInput, Finding } from "../types.js";
const PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /Access-Control-Allow-Origin\s*[:=]\s*["']\*["']/i, message: "Access-Control-Allow-Origin is set to '*'." },
  { pattern: /cors\(\s*["']?\*\s*["']?\)/i, message: "CORS is opened to any origin via cors(*)." },
  { pattern: /cors\(\s*\{[^)]*origin\s*:\s*["']\*["'][^)]*\}\s*\)/i, message: "CORS origin is configured as '*'." },
  { pattern: /\.set(Header)?\(\s*["']Access-Control-Allow-Origin["'],\s*["']\*["']\s*\)/i, message: "Access-Control-Allow-Origin header uses wildcard origin." },
];
export const noWildcardCors: Check = {
  name: "no-wildcard-cors", domain: "security",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];
    for (const file of input.files) {
      const lines = file.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        for (const { pattern, message } of PATTERNS) {
          pattern.lastIndex = 0;
          if (pattern.test(lines[i])) {
            findings.push({ file: file.path, line: i + 1, message, severity: "warning" });
          }
        }
      }
    }
    const passed = findings.length === 0;
    return {
      check: "no-wildcard-cors",
      passed,
      score: passed ? 100 : Math.max(0, 100 - findings.length * 15),
      details: passed ? "No wildcard CORS headers detected." : `Found ${findings.length} wildcard CORS configuration(s).`,
      findings,
    };
  },
};
