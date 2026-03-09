import type { Check, CheckResult, EvalInput, Finding } from "../types.js";

/**
 * Check for potential memory leaks: unclosed streams, missing cleanup
 */
export const noMemoryLeak: Check = {
  name: "no-memory-leak",
  domain: "performance",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];

    for (const file of input.files) {
      if (!isJavaScriptOrTypeScript(file.language)) continue;
      
      const lines = file.content.split("\n");
      
      // Check for unclosed streams
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // fs.createReadStream without .close() or using
        if (/fs\.createReadStream\s*\(/.test(line) || /createReadStream\s*\(/.test(line)) {
          const context = lines.slice(Math.max(0, i - 2), i + 15).join("\n");
          if (!hasProperCleanup(context)) {
            findings.push({
              file: file.path,
              line: i + 1,
              message: "Unclosed stream: createReadStream without proper cleanup. Use 'using' or call .close().",
              severity: "error",
            });
          }
        }
        
        // fs.createWriteStream without .close()
        if (/fs\.createWriteStream\s*\(/.test(line) || /createWriteStream\s*\(/.test(line)) {
          const context = lines.slice(Math.max(0, i - 2), i + 15).join("\n");
          if (!hasProperCleanup(context)) {
            findings.push({
              file: file.path,
              line: i + 1,
              message: "Unclosed stream: createWriteStream without proper cleanup. Use 'using' or call .close().",
              severity: "error",
            });
          }
        }
        
        // Event listeners without cleanup
        if (/\.addEventListener\s*\(/.test(line) || /on\s*\(\s*['"][^"']+['"]/.test(line)) {
          const funcStart = findFunctionStart(lines, i);
          if (funcStart >= 0) {
            const funcBody = lines.slice(funcStart, i + 10).join("\n");
            // Check if this is inside a component (React/Vue/Svelte) that might not unmount
            if (file.path.includes("component") || file.path.includes(".jsx") || file.path.includes(".tsx")) {
              if (!hasRemoveListener(funcBody) && !file.path.includes("useEffect")) {
                findings.push({
                  file: file.path,
                  line: i + 1,
                  message: "Event listener added without cleanup. Add removeEventListener in cleanup/return function.",
                  severity: "warning",
                });
              }
            }
          }
        }
        
        // setInterval without clearInterval
        if (/setInterval\s*\(/.test(line)) {
          const funcStart = findFunctionStart(lines, i);
          if (funcStart >= 0) {
            const funcBody = lines.slice(funcStart, i + 10).join("\n");
            if (!hasClearInterval(funcBody) && !file.path.includes("useEffect")) {
              findings.push({
                file: file.path,
                line: i + 1,
                message: "setInterval without clearInterval. This causes memory leaks. Clear in cleanup.",
                severity: "warning",
              });
            }
          }
        }
        
        // Database connections not properly closed
        if (/pool\.connect\s*\(\)/.test(line) || /db\.connect\s*\(\)/.test(line)) {
          const context = lines.slice(Math.max(0, i - 2), i + 15).join("\n");
          if (!hasDbClose(context)) {
            findings.push({
              file: file.path,
              line: i + 1,
              message: "Database connection created without .end() or .release() call.",
              severity: "error",
            });
          }
        }
      }
    }

    const passed = findings.length === 0;
    return {
      check: "no-memory-leak",
      passed,
      score: passed ? 100 : Math.max(0, 100 - findings.length * 15),
      details: passed ? "No obvious memory leak patterns detected." : `Found ${findings.length} potential memory leak(s).`,
      findings,
    };
  },
};

function isJavaScriptOrTypeScript(language: string): boolean {
  const jsExts = ["javascript", "typescript", "js", "ts", "jsx", "tsx", "vue", "svelte"];
  return jsExts.includes(language.toLowerCase());
}

function hasProperCleanup(content: string): boolean {
  return /\.close\s*\(\)/.test(content) || 
         /\.end\s*\(\)/.test(content) ||
         /await\s+.*\.close/.test(content) ||
         /await\s+.*\.end/.test(content) ||
         /using\s*\(/.test(content) ||
         /\.destroy\s*\(\)/.test(content);
}

function findFunctionStart(lines: string[], currentIndex: number): number {
  for (let i = currentIndex; i >= Math.max(0, currentIndex - 20); i--) {
    if (/\bfunction\s+\w+\s*\(/.test(lines[i]) ||
        /\(\s*\)\s*=>/.test(lines[i]) ||
        /\bconst\s+\w+\s*=\s*async\s*\(/.test(lines[i]) ||
        /useEffect\s*\(/.test(lines[i])) {
      return i;
    }
  }
  return -1;
}

function hasRemoveListener(content: string): boolean {
  return /\.removeEventListener\s*\(/.test(content) ||
         /\.off\s*\(/.test(content) ||
         /return\s*\(\s*\)\s*=>\s*\{?\s*.*remove/.test(content) ||
         /return\s+function\s*\(\s*\)/.test(content);
}

function hasClearInterval(content: string): boolean {
  return /clearInterval\s*\(/.test(content) ||
         /clearTimeout\s*\(/.test(content) ||
         /return\s*\(\s*\)\s*=>\s*\{?\s*clear/.test(content);
}

function hasDbClose(content: string): boolean {
  return /\.end\s*\(\)/.test(content) ||
         /\.release\s*\(\)/.test(content) ||
         /\.close\s*\(\)/.test(content) ||
         /await\s+.*\.end/.test(content) ||
         /await\s+.*\.release/.test(content);
}
