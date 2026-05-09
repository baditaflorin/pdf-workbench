# 0069 Type Safety At Boundaries

## Status

Accepted

## Decision

External JSON, clipboard text, imported files, and browser storage records are treated as `unknown` and validated with zod or explicit narrowing. No `any`, no `@ts-ignore`, and no unchecked archive casts.

## Consequences

Malformed state files fail with an actionable import error.
