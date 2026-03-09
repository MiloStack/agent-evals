import type { Check, CheckResult, EvalInput, Finding } from "../types.js";

/**
 * Check for blocking synchronous loops in JavaScript
 * Synchronous loops can block the event loop and cause UI freezing
 */
export const noSyncLoop: Check = {
  name: "no-sync-loop",
  domain: "performance",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];

    for (const file of input.files) {
      if (!isJavaScriptOrTypeScript(file.language)) continue;
      
      const lines = file.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for synchronous for loops with potentially expensive operations
        if (/\bfor\s*\([^)]*\)\s*\{/.test(line) || /\bwhile\s*\([^)]*\)\s*\{/.test(line)) {
          const nextLines = lines.slice(i, Math.min(i + 10, lines.length)).join("\n");
          
          // Check for blocking operations inside loops
          if (/\.(?:readFileSync|writeFileSync|execSync|readFile|writeFile|requestSync)\s*\(/.test(nextLines) ||
              /\b(?:sleep|delay|wait)\s*\([^)]*\)\s*(?:\.|;)/.test(nextLines)) {
            findings.push({
              file: file.path,
              line: i + 1,
              message: "Synchronous blocking operation in loop. Consider async/await or chunking.",
              severity: "warning",
            });
          }
        }
        
        // Check for Array.forEach with sync operations on large datasets
        if (/\.forEach\s*\(/.test(line)) {
          const nextLines = lines.slice(i, Math.min(i + 5, lines.length)).join("\n");
          if (/\b(?:execSync|readFileSync|writeFileSync)\s*\(/.test(nextLines)) {
            findings.push({
              file: file.path,
              line: i + 1,
              message: "forEach with synchronous blocking call. Consider for...of with await.",
              severity: "warning",
            });
          }
        }
      }
    }

    const passed = findings.length === 0;
    return {
      check: "no-sync-loop",
      passed,
      score: passed ? 100 : Math.max(0, 100 - findings.length * 15),
      details: passed ? "No blocking synchronous loops detected." : `Found ${findings.length} blocking sync loop(s).`,
      findings,
    };
  },
};

function isJavaScriptOrTypeScript(language: string): boolean {
  const jsExts = ["javascript", "typescript", "js", "ts", "jsx", "tsx", "vue", "svelte"];
  return jsExts.includes(language.toLowerCase());
}
