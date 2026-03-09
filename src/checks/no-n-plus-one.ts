import type { Check, CheckResult, EvalInput, Finding } from "../types.js";

/**
 * Check for N+1 query patterns in database code
 * N+1 queries are a common performance anti-pattern
 */
export const noNPlusOne: Check = {
  name: "no-n-plus-one",
  domain: "performance",
  async run(input: EvalInput): Promise<CheckResult> {
    const findings: Finding[] = [];

    for (const file of input.files) {
      if (!isDatabaseFile(file.language, file.path)) continue;
      
      const content = file.content;
      const lines = content.split("\n");
      
      // Check for patterns like: for loop calling db.query inside
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for for/foreach/while iterating and making DB calls
        const loopMatch = line.match(/\b(for|foreach|while|forEach)\s*\(/);
        if (loopMatch) {
          // Look ahead for database calls inside the loop
          const loopBody = extractLoopBody(lines, i);
          if (loopBody && hasDbQuery(loopBody, file.path)) {
            findings.push({
              file: file.path,
              line: i + 1,
              message: "Potential N+1 query pattern: database call inside loop. Use batch queries or JOINs.",
              severity: "warning",
            });
          }
        }
        
        // Check for .map() with async DB queries (common in Node.js)
        // Also catch .map() with non-awaited DB calls (also N+1)
        if (/\.map\s*\(/.test(line)) {
          const mapBody = lines.slice(i, Math.min(i + 5, lines.length)).join("\n");
          if (hasDbQueryInMap(mapBody)) {
            findings.push({
              file: file.path,
              line: i + 1,
              message: "Potential N+1 pattern: .map() with database queries. Use Promise.all with batch queries.",
              severity: "warning",
            });
          }
        }
      }
    }

    const passed = findings.length === 0;
    return {
      check: "no-n-plus-one",
      passed,
      score: passed ? 100 : Math.max(0, 100 - findings.length * 20),
      details: passed ? "No N+1 query patterns detected." : `Found ${findings.length} potential N+1 query pattern(s).`,
      findings,
    };
  },
};

function isDatabaseFile(language: string, path: string): boolean {
  const dbExts = ["javascript", "typescript", "js", "ts", "jsx", "tsx", "python", "go", "java", "sql"];
  const dbPaths = ["db", "database", "model", "repository", "repo", "orm", "sequelize", "prisma", "typeorm", "query"];
  
  return dbExts.includes(language.toLowerCase()) || 
         dbPaths.some(p => path.toLowerCase().includes(p));
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

function hasDbQuery(content: string, filePath: string): boolean {
  const dbPatterns = [
    /\.query\s*\(/,
    /\.find\s*\(/,
    /\.findOne\s*\(/,
    /\.findAll\s*\(/,
    /\.get\s*\(/,
    /\.select\s*\(/,
    /\.execute\s*\(/,
    /SELECT\s+.*FROM/i,
    /await\s+.*\.find/,
    /await\s+.*\.query/,
    /db\.getConnection/,
    /pool\.query/,
  ];
  
  return dbPatterns.some(p => p.test(content));
}

function hasDbQueryInMap(content: string): boolean {
  return /\.find\s*\(/.test(content) || 
         /\.query\s*\(/.test(content) ||
         /\.get\s*\(/.test(content);
}
