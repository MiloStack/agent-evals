import type { Check, CheckResult, EvalInput, Finding } from "../types.js";
const MAX = 500;
export const fileSize: Check = {
  name:"file-size", domain:"devops",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];
    for (const f of input.files) { const n=f.content.split("\n").length; if(n>MAX) findings.push({file:f.path,message:`File has ${n} lines (max: ${MAX}).`,severity:"warning"}); }
    const passed = findings.length === 0;
    return { check:"file-size", passed, score: passed?100:Math.max(0,100-findings.length*20),
      details: passed ? `All files under ${MAX} lines.` : `${findings.length} file(s) exceed ${MAX} lines.`, findings };
  },
};
