# 0048 Determinism And Reproducibility

## Status

Accepted

## Context

Phase 2 requires identical input to produce identical canonical output. V1 includes timestamps and random ids in project state, which are fine for UI history but not for reproducible exports.

## Decision

Canonical intelligence/export metadata uses stable ordering, schema versions, file-derived source identifiers, app version, build commit, and operation parameters. Runtime timestamps may appear as provenance but deterministic tests compare canonical metadata with timestamps removed.

## Consequences

Fixture tests can detect accidental nondeterminism. User downloads still include useful generated-at metadata.

## Alternatives Considered

Removing all timestamps was rejected because provenance needs them.
