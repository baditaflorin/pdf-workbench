# 0016 - Local Git Hooks

## Status

Accepted

## Context

The project intentionally does not use GitHub Actions. Checks need to run locally.

## Decision

Use a committed `.githooks/` directory wired by `make install-hooks`. Hooks validate Conventional Commits, run format/lint/type checks, run gitleaks when installed, and gate pushes with build/test/smoke.

## Consequences

Contributors opt in once with `make install-hooks`. The hooks are idempotent and runnable manually through Make targets.

## Alternatives Considered

Lefthook was considered, but plain shell hooks avoid another tool dependency.
