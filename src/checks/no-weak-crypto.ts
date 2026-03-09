import type { Check, CheckResult, EvalInput, Finding } from "../types.js";
const WEAK_HASH = /\b(?:md5|sha1|des|rc4)\b/i;
const CONTEXT = /\b(?:crypto|hash|cipher|hashlib|openssl|CryptoJS|jsonwebtoken)\b/i;
const ECB_MODE = /\bAES[-_]?\d*[-_]?ECB\b/i;
export const noWeakCrypto: Check = {
  name: "no-weak-crypto", domain: "security",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];
    for (const file of input.files) {
      const lines = file.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (ECB_MODE.test(lines[i])) {
          findings.push({ file: file.path, line: i + 1, message: "ECB mode provides no IV and is insecure.", severity: "warning" });
        }
        if (WEAK_HASH.test(lines[i]) && CONTEXT.test(lines[i])) {
          findings.push({ file: file.path, line: i + 1, message: "Weak hash (md5/sha1/des/rc4) detected in cryptographic context.", severity: "warning" });
        }
      }
    }
    const passed = findings.length === 0;
    return {
      check: "no-weak-crypto",
      passed,
      score: passed ? 100 : Math.max(0, 100 - findings.length * 20),
      details: passed ? "No weak crypto usage detected." : `Found ${findings.length} weak crypto indication(s).`,
      findings,
    };
  },
};
