# 0049 Inspectability And Debug Surface

## Status

Accepted

## Context

Power users and maintainers need to see why a browser-only inference was made, especially with low-confidence OCR, mixed-language extraction, and raw form fields.

## Decision

`?debug=1` enables a debug panel showing the current project intelligence, operation timings, raw field identifiers, condition scores, and recent activity. Debug information is never required for normal use.

## Consequences

Support and fixture triage become easier without exposing implementation noise to every user.

## Alternatives Considered

Always-visible diagnostics were rejected because they would make the app feel less calm and domain-focused.
