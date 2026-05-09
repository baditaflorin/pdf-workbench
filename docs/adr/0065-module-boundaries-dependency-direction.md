# 0065 Module Boundaries And Dependency Direction

## Status

Accepted

## Decision

The dependency direction is UI -> feature services -> shared lib/primitives. Archive, persistence, conversion, form intelligence, PDF mutation, rendering, OCR, and inference stay in separate modules. UI components may orchestrate but should not own serialization formats.

## Consequences

Phase 3 adds a project archive boundary but does not split the entire workbench component in one risky pass.

## Alternatives Considered

A large component rewrite was rejected because completeness fixes were higher impact and lower risk.
