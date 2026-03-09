# agent-evals

Domain-specific evaluation frameworks for AI coding agents.

> LLM-as-judge fails on specialized tasks (50%+ error rates). Generic metrics don't catch domain-specific failures. agent-evals fixes this.

## What it does

Evaluates AI coding agent outputs against domain-specific criteria:
- **Code correctness** — does it actually work?
- **Security** — common vulnerability patterns (injection, auth, secrets)
- **Performance** — runtime complexity, resource usage
- **Style conformance** — project conventions, not just linting
- **Test coverage** — did the agent write meaningful tests?

## Quick start

```bash
npx agent-evals evaluate ./agent-output --domain devops
```

## Status

🚧 Early development — shipping fast.

## License

MIT
