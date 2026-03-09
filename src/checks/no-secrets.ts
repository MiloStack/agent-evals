import type { Check, CheckResult, EvalInput, Finding } from "../types.js";
const PATS: Array<{p:RegExp,l:string}> = [
  {p:/(?:api[_-]?key|apikey)\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/gi, l:"API key"},
  {p:/(?:secret|password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/gi, l:"password/secret"},
  {p:/AKIA[0-9A-Z]{16}/g, l:"AWS access key"},
  {p:/ghp_[A-Za-z0-9]{36}/g, l:"GitHub PAT"},
  {p:/sk-[A-Za-z0-9]{32,}/g, l:"secret key"},
  {p:/-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g, l:"private key"},
];
export const noSecrets: Check = {
  name:"no-secrets", domain:"devops", critical:true,
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];
    for (const file of input.files) {
      const lines = file.content.split("\n");
      for (let i=0;i<lines.length;i++) {
        for (const {p,l} of PATS) { p.lastIndex=0; if(p.test(lines[i])) findings.push({file:file.path,line:i+1,message:`Possible hardcoded ${l}.`,severity:"error"}); }
      }
    }
    const passed = findings.length === 0;
    return { check:"no-secrets", passed, score: passed?100:Math.max(0,100-findings.length*25),
      details: passed ? "No secrets detected." : `Found ${findings.length} potential secret(s).`, findings };
  },
};
