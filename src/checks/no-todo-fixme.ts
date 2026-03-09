import type { Check, CheckResult, EvalInput, Finding } from "../types.js";
const RE = /\b(TODO|FIXME|HACK|XXX)\b/gi;
export const noTodoFixme: Check = {
  name:"no-todo-fixme", domain:"devops",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];
    for (const file of input.files) {
      const lines = file.content.split("\n");
      for (let i=0;i<lines.length;i++) { const m=lines[i].match(RE); if(m) findings.push({file:file.path,line:i+1,message:`Unresolved ${m[0].toUpperCase()}.`,severity:"warning"}); }
    }
    const passed = findings.length === 0;
    return { check:"no-todo-fixme", passed, score: passed?100:Math.max(0,100-findings.length*10),
      details: passed ? "No unresolved TODO/FIXME." : `Found ${findings.length} unresolved comment(s).`, findings };
  },
};
