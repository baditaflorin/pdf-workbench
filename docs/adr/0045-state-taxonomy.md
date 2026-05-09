# 0045 State Taxonomy

## Status

Accepted

## Context

V1 has a single `busy` string and an error slot. Real data requires more explicit states: empty, opening, loaded, analyzing, extracting, OCR, exporting, recoverable error, fatal failure, cancelled, and debug.

## Decision

Use explicit operation state in the UI, including an operation id to ignore stale async work. Every state has an action: open another PDF, cancel long work, retry extraction/OCR, export, or inspect debug information.

## Consequences

Duplicate clicks and stale async updates become defined behavior. This does not add server state.

## Alternatives Considered

A full external state-machine library was rejected as unnecessary for the current surface.
