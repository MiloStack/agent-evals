# agent-evals

Domain-specific evaluation framework for AI coding agent outputs.

> LLM-as-judge fails on specialized tasks (50%+ error rates). Generic metrics don't catch domain-specific failures. agent-evals fixes this with static analysis checks tailored to DevOps, security, and code quality.

## What it does

Evaluates AI coding agent outputs against domain-specific criteria:

### DevOps Checks
- **has-tests** — Does the output include test files? Scores based on test-to-source ratio.
- **no-secrets** — Scans for hardcoded API keys, AWS credentials, passwords, tokens.
- **no-todo-fixme** — Flags unresolved TODO/FIXME/HACK/XXX comments left behind.
- **file-size** — Flags files over 500 lines (indicates monolithic code).
- **error-handling** — Detects bare catch blocks and swallowed errors.

### Security Checks
- **no-insecure-http** — Flags non-HTTPS URLs (insecure HTTP).
- **no-disabled-tls** — Detects disabled TLS verification.
- **no-dangerous-shell** — Catches shell command injection vulnerabilities.
- **no-weak-crypto** — Detects weak cryptography (MD5, SHA1, ECB mode).
- **no-wildcard-cors** — Flags wildcard CORS policies.

### Performance Checks
- **no-inner-html** — Detects dangerous innerHTML usage (DOM XSS vector).
- **no-sync-loop** — Catches blocking synchronous operations in loops.
- **no-n-plus-one** — Detects N+1 database query patterns.
- **no-memory-leak** — Finds unclosed streams, missing cleanup.
- **no-dom-thrashing** — Catches inefficient DOM manipulation patterns.

## Installation

```bash
npm install -g agent-evals
# or
npx agent-evals
```

## Usage

### CLI

```bash
# Evaluate a file or directory
agent-evals evaluate ./src

# Output as JSON (for CI)
agent-evals evaluate ./src --format json

# Strict mode: exit 1 if any check fails
agent-evals evaluate ./src --strict

# Specify domain (devops, security, or performance)
agent-evals evaluate ./src --domain devops
agent-evals evaluate ./src --domain security
agent-evals evaluate ./src --domain performance

Run with --domain security to check for insecure HTTP/TLS usage, dangerous shell calls, weak cryptography, and wildcard CORS.

Run with --domain performance to check for DOM XSS, blocking sync loops, N+1 queries, memory leaks, and DOM thrashing.
```

### Programmatic

```typescript
import { evaluate } from 'agent-evals';

const report = await evaluate('./src', 'devops');

console.log(report);
// {
//   timestamp: '2026-03-09T03:30:00.000Z',
//   domain: 'devops',
//   inputFiles: 5,
//   checks: [...],
//   overallScore: 85.4,
//   passed: true
// }
```

## Example Output

```
═════════════════════════════════════════════════════════════
  Agent Eval Report [devops]
═════════════════════════════════════════════════════════════

  Status:         ✅ PASSED
  Overall Score:  85.4/100
  Input Files:    5
  Timestamp:      3/9/2026, 3:30:00 AM

  Check Results:
  ─────────────────────────────────────────────────────────────
  ✓ has-tests            90/100
    Found 2 test file(s) and 3 source file(s)
  ✓ no-secrets          100/100
    No hardcoded secrets detected
  ✓ no-todo-fixme       100/100
    No TODO/FIXME/HACK/XXX comments
  ✓ file-size           100/100
    All files under 500 lines
  ✗ error-handling       60/100
    Found 1 potential error handling issue(s)
    Findings:
      • src/api.ts:42: Catch block may not handle errors properly
        Consider logging or rethrowing the error

═════════════════════════════════════════════════════════════
```

## Architecture

- **Input parser** (`src/parser.ts`) — Accepts file/directory paths, detects languages
- **Check runner** (`src/checks/`) — Define checks as classes, run against EvalInput
- **Report generator** (`src/report.ts`) — Aggregates results, formats output
- **CLI** (`src/cli.ts`) — Command-line interface

## Testing

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
npm run build      # TypeScript compilation
npm run lint       # ESLint
```

## Status

✅ **Core engine complete** — Parser, 15 checks across 3 domains, report generator, CLI all working.
- [x] Project scaffold (package.json, tsconfig, eslint, vitest)
- [x] Input parser with tests
- [x] Check interface + runner with tests
- [x] 5 DevOps checks (has-tests, no-secrets, no-todo-fixme, file-size, error-handling)
- [x] 5 Security checks (no-insecure-http, no-disabled-tls, no-dangerous-shell, no-weak-crypto, no-wildcard-cors)
- [x] 5 Performance checks (no-inner-html, no-sync-loop, no-n-plus-one, no-memory-leak, no-dom-thrashing)
- [x] Report generator with tests
- [x] CLI entry point with tests
- [x] All tests passing (46 tests)
- [x] npm run build succeeds

**Next steps:**
- [ ] Custom check plugins
- [ ] GitHub Actions integration
- [ ] Web dashboard

## GitHub Action

Use the `agent-evals` GitHub Action to gate PRs and CI runs with the same domain-aware checks that power the CLI. The action is defined in `action.yml` and publishes the compiled code from `dist/src/action.js`. Drop in the workflow below or see `.github/workflows/agent-evals-example.yml` for a runnable template.

### Inputs

| Input | Description | Default |
| --- | --- | --- |
| `path` | Path or directory to evaluate | `.` |
| `domain` | Evaluation domain: `devops`, `security`, or `performance` | `devops` |
| `strict` | When `true`, fail the job if any check fails | `false` |

### Example usage

```yaml
steps:
  - uses: actions/checkout@v4
  - name: Run agent-evals
    uses: MiloStack/agent-evals@v0.1.0
    with:
      path: ./src
      domain: security
      strict: true
```


## Release

- GitHub release: [`v0.1.0`](https://github.com/MiloStack/agent-evals/releases/tag/v0.1.0)
- GitHub Pages landing page: https://milostack.github.io/agent-evals/

## License

MIT
