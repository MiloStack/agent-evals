# PRD: Core Eval Engine (Issue #1)

## Goal
Build the core evaluation pipeline for agent-evals — a Node.js/TypeScript CLI tool that evaluates AI coding agent outputs against domain-specific quality checks.

## Architecture
- **Language:** TypeScript (Node.js)
- **Package manager:** npm
- **Output format:** JSON report + pretty-printed summary
- **Entry point:** `src/index.ts` (library) + `src/cli.ts` (CLI)

## What to build

### 1. Project scaffold
- `package.json` with name `agent-evals`, bin entry pointing to CLI
- TypeScript config (`tsconfig.json`)
- ESLint config
- Basic test setup (vitest)

### 2. Input parser (`src/parser.ts`)
- Accept a file path, directory path, or stdin pipe
- Detect input type: single file, diff/patch, directory of files
- Return normalized `EvalInput` object:
  ```ts
  interface EvalInput {
    files: Array<{
      path: string;
      content: string;
      language: string;
    }>;
    metadata?: {
      agent?: string;
      prompt?: string;
    };
  }
  ```

### 3. Check runner (`src/checks/`)
- Define a `Check` interface:
  ```ts
  interface Check {
    name: string;
    domain: string;
    run(input: EvalInput): Promise<CheckResult>;
  }
  
  interface CheckResult {
    check: string;
    passed: boolean;
    score: number; // 0-100
    details: string;
    findings: Finding[];
  }
  ```
- Implement these initial checks for the `devops` domain:
  1. **`has-tests`** — Does the output include test files? Score based on ratio of test files to source files.
  2. **`no-secrets`** — Scan for hardcoded secrets, API keys, passwords, tokens. Use regex patterns.
  3. **`no-todo-fixme`** — Flag unresolved TODO/FIXME/HACK/XXX comments left by the agent.
  4. **`file-size`** — Flag files over 500 lines (agent tendency to dump everything in one file).
  5. **`error-handling`** — Check for bare catch blocks, swallowed errors, missing error handling patterns.

### 4. Report generator (`src/report.ts`)
- Aggregate check results into an `EvalReport`:
  ```ts
  interface EvalReport {
    timestamp: string;
    domain: string;
    inputFiles: number;
    checks: CheckResult[];
    overallScore: number; // weighted average
    passed: boolean; // all critical checks passed
  }
  ```
- JSON output mode (for CI) and pretty-printed mode (for humans)

### 5. CLI (`src/cli.ts`)
- `agent-evals evaluate <path> [--domain devops] [--format json|pretty] [--strict]`
- `--strict` mode: exit code 1 if any check fails
- Default: exit code 1 only if critical checks fail (no-secrets)

### 6. Tests
- Write tests FIRST for each check
- Test with fixture files (create `test/fixtures/` with sample agent outputs)
- Test the parser with different input types
- Test the report generator
- All tests must pass before any PR/push

## Checklist
- [ ] Project scaffold (package.json, tsconfig, eslint, vitest)
- [ ] Input parser with tests
- [ ] Check interface + runner with tests
- [ ] 5 initial devops checks with tests
- [ ] Report generator with tests
- [ ] CLI entry point with tests
- [ ] All tests passing
- [ ] `npm run build` succeeds
- [ ] README updated with real usage examples

## Non-goals
- No API/server yet (that's a later issue)
- No LLM calls for evaluation (pure static analysis for v1)
- No paid features yet
