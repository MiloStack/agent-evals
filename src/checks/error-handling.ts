import type { Check, CheckResult, EvalInput, Finding } from "../types.js";
const BARE_CATCH = /catch\s*\([^)]*\)\s*\{\s*\}/g;
const BARE_EXCEPT = /except\s*:\s*(?:pass|\.\.\.)\s*$/gm;
const CODE_LANGS = new Set(["typescript","javascript","python"]);
export const errorHandling: Check = {
  name:"error-handling", domain:"devops",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];
    const code = input.files.filter(f => CODE_LANGS.has(f.language));
    if (!code.length) return { check:"error-handling", passed:true, score:100, details:"No code files.", findings:[] };
    for (const file of code) {
      if (file.language==="typescript"||file.language==="javascript") {
        let m: RegExpExecArray|null; BARE_CATCH.lastIndex=0;
        while ((m=BARE_CATCH.exec(file.content))!==null) {
          const line = file.content.substring(0,m.index).split("\n").length;
          findings.push({file:file.path,line,message:"Empty catch block.",severity:"error"});
        }
      }
      if (file.language==="python") {
        const lines = file.content.split("\n");
        for (let i=0;i<lines.length;i++) { BARE_EXCEPT.lastIndex=0; if(BARE_EXCEPT.test(lines[i])) findings.push({file:file.path,line:i+1,message:"Bare except: pass.",severity:"error"}); }
      }
    }
    const passed = findings.filter(f=>f.severity==="error").length===0;
    return { check:"error-handling", passed, score: Math.max(0,100-findings.length*15),
      details: passed ? "No error-handling issues." : `Found ${findings.length} issue(s).`, findings };
  },
};
