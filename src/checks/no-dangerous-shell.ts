import type { Check, CheckResult, EvalInput, Finding } from "../types.js";
const SHELL_CALL = /\b(?:exec|execSync|spawn|spawnSync|system|popen|shell_exec)\s*\(([^)]*)\)/g;
const DANG_PATTERN = /(\+|\$\{|`|;|&&|\|\||\|)/;
export const noDangerousShell: Check = {
  name: "no-dangerous-shell", domain: "security",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];
    for (const file of input.files) {
      const lines = file.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        SHELL_CALL.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = SHELL_CALL.exec(lines[i])) !== null) {
          const args = match[1] ?? "";
          if (DANG_PATTERN.test(args)) {
            findings.push({
              file: file.path,
              line: i + 1,
              message: "Shell invocation uses string interpolation or concatenation, which risks command injection.",
              severity: "warning",
            });
          }
        }
      }
    }
    const passed = findings.length === 0;
    return {
      check: "no-dangerous-shell",
      passed,
      score: passed ? 100 : Math.max(0, 100 - findings.length * 20),
      details: passed ? "No risky shell invocations detected." : `Found ${findings.length} potentially dangerous shell call(s).`,
      findings,
    };
  },
};
