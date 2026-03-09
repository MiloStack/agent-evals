import type { Check, CheckResult, EvalInput, Finding } from "../types.js";

/**
 * Check for DOM XSS via innerHTML usage
 * innerHTML is a common vector for DOM-based XSS attacks
 */
export const noInnerHtml: Check = {
  name: "no-inner-html",
  domain: "performance",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];
    const patterns = [
      { regex: /\.innerHTML\s*=/g, message: "Direct innerHTML assignment" },
      { regex: /insertAdjacentHTML\s*\(/g, message: "insertAdjacentHTML usage" },
      { regex: /\$\s*\([^)]*\)\.html\s*\(/g, message: "jQuery .html() call" },
      { regex: /document\.write\s*\(/g, message: "document.write usage" },
    ];

    for (const file of input.files) {
      if (!isJavaScriptOrTypeScript(file.language)) continue;
      
      const lines = file.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        for (const { regex, message } of patterns) {
          regex.lastIndex = 0;
          if (regex.test(lines[i])) {
            // Skip if there's proper sanitization nearby
            const context = lines.slice(Math.max(0, i - 2), i + 3).join("\n");
            if (!context.includes("sanitize") && !context.includes("escapeHtml") && 
                !context.includes("textContent") && !context.includes("innerText")) {
              findings.push({
                file: file.path,
                line: i + 1,
                message: `Potential DOM XSS: ${message}. Consider using textContent or sanitizing input.`,
                severity: "error",
              });
            }
          }
        }
      }
    }

    const passed = findings.length === 0;
    return {
      check: "no-inner-html",
      passed,
      score: passed ? 100 : Math.max(0, 100 - findings.length * 20),
      details: passed ? "No dangerous innerHTML usage detected." : `Found ${findings.length} potential DOM XSS issue(s).`,
      findings,
    };
  },
};

function isJavaScriptOrTypeScript(language: string): boolean {
  const jsExts = ["javascript", "typescript", "js", "ts", "jsx", "tsx", "vue", "svelte"];
  return jsExts.includes(language.toLowerCase());
}
