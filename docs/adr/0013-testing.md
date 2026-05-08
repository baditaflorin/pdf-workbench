# 0013 - Testing Strategy

## Status

Accepted

## Context

PDF workflows are risky because a broken export can silently damage documents.

## Decision

Use Vitest for pure PDF state and export helpers. Use Playwright smoke tests against the built `docs/` site. `make test`, `make lint`, `make build`, and `make smoke` are the local quality gates.

## Consequences

Critical browser flows are checked without GitHub Actions. Larger fixture-based PDF regression tests can be added as the feature set grows.

## Alternatives Considered

Snapshotting generated PDFs byte-for-byte was rejected because PDF metadata can be noisy; tests should inspect semantic outcomes.
