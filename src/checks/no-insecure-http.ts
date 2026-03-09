import type { Check, CheckResult, EvalInput, Finding } from "../types.js";
const INSECURE_URL = /\b(?:http|ws):\/\/[^\s"']+/gi;
export const noInsecureHttp: Check = {
  name: "no-insecure-http", domain: "security",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];
    for (const file of input.files) {
      const lines = file.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        INSECURE_URL.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = INSECURE_URL.exec(lines[i])) !== null) {
          findings.push({
            file: file.path,
            line: i + 1,
            message: `Insecure endpoint detected (${match[0]}).`,
            severity: "warning",
          });
        }
      }
    }
    const passed = findings.length === 0;
    return {
      check: "no-insecure-http",
      passed,
      score: passed ? 100 : Math.max(0, 100 - findings.length * 15),
      details: passed ? "No insecure http/ws URLs found." : `Found ${findings.length} insecure URL(s).`,
      findings,
    };
  },
};
