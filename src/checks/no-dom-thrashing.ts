import type { Check, CheckResult, EvalInput, Finding } from "../types.js";

/**
 * Check for inefficient DOM manipulation patterns
 * Repeated DOM updates cause layout thrashing and poor performance
 */
export const noDomThrashing: Check = {
  name: "no-dom-thrashing",
  domain: "performance",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];

    for (const file of input.files) {
      if (!isJavaScriptOrTypeScript(file.language)) continue;
      
      const lines = file.content.split("\n");
      
      // Check for repeated style/class changes in loops
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // for/while loop with style/class mutations
        const loopMatch = line.match(/\b(for|while|forEach)\s*\(/);
        if (loopMatch) {
          const loopBody = extractLoopBody(lines, i);
          if (loopBody && hasDomMutation(loopBody)) {
            findings.push({
              file: file.path,
              line: i + 1,
              message: "DOM manipulation inside loop causes layout thrashing. Cache DOM references or use documentFragment.",
              severity: "warning",
            });
          }
        }
        
        // Multiple querySelector in same function without caching
        if (line.includes("querySelector") || line.includes("getElementBy")) {
          const funcStart = findFunctionStart(lines, i);
          if (funcStart >= 0) {
            const funcBody = lines.slice(funcStart, i + 20).join("\n");
            const queryCount = (funcBody.match(/querySelector|getElementBy/g) || []).length;
            if (queryCount > 2 && !hasCachedQuery(funcBody)) {
              findings.push({
                file: file.path,
                line: i + 1,
                message: `Function has ${queryCount} DOM queries without caching. Cache element references.`,
                severity: "info",
              });
            }
          }
        }
      }
    }

    const passed = findings.length === 0;
    return {
      check: "no-dom-thrashing",
      passed,
      score: passed ? 100 : Math.max(0, 100 - findings.length * 10),
      details: passed ? "No DOM thrashing patterns detected." : `Found ${findings.length} potential DOM thrashing issue(s).`,
      findings,
    };
  },
};

function isJavaScriptOrTypeScript(language: string): boolean {
  const jsExts = ["javascript", "typescript", "js", "ts", "jsx", "tsx", "vue", "svelte"];
  return jsExts.includes(language.toLowerCase());
}

function extractLoopBody(lines: string[], startIndex: number): string | null {
  let braceCount = 0;
  let started = false;
  const body: string[] = [];
  
  for (let i = startIndex; i < Math.min(startIndex + 20, lines.length); i++) {
    const line = lines[i];
    if (line.includes("{") && !started) {
      started = true;
    }
    if (started) {
      body.push(line);
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      if (braceCount === 0 && body.length > 1) break;
    }
  }
  
  return body.length > 0 ? body.join("\n") : null;
}

function hasDomMutation(content: string): boolean {
  const domMutations = [
    /\.style\./,
    /\.classList\./,
    /\.setAttribute\s*\(/,
    /\.innerHTML\s*=/,
    /\.innerText\s*=/,
    /\.textContent\s*=/,
    /\.appendChild\s*\(/,
    /\.removeChild\s*\(/,
    /\.remove\s*\(/,
    /document\.body\./,
    /document\.head\./,
  ];
  
  return domMutations.some(p => p.test(content));
}

function findFunctionStart(lines: string[], currentIndex: number): number {
  for (let i = currentIndex; i >= Math.max(0, currentIndex - 30); i--) {
    if (/\bfunction\s+\w+\s*\(/.test(lines[i]) ||
        /\(\s*\)\s*=>/.test(lines[i]) ||
        /\bconst\s+\w+\s*=\s*async\s*\(/.test(lines[i]) ||
        /\b\w+\s*:\s*async\s*\(/.test(lines[i]) ||
        /\bmethod\s*\(\s*\)/.test(lines[i])) {
      return i;
    }
  }
  return -1;
}

function hasCachedQuery(content: string): boolean {
  // Check if queries are assigned to variables before use
  return /const\s+\w+\s*=\s*.*querySelector/.test(content) ||
         /let\s+\w+\s*=\s*.*querySelector/.test(content) ||
         /var\s+\w+\s*=\s*.*querySelector/.test(content);
}
