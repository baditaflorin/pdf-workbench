# 0043 Domain Vocabulary

## Status

Accepted

## Context

Raw names like `topmostSubform[0].Page1[0].f1_01[0]` and parser offsets are technically true but useless to most knowledge workers.

## Decision

User-facing language will use PDF/document terms: "fillable form", "scanned document", "restricted PDF", "corrupted or incomplete file", "field looks required", "low OCR confidence", "large document". Internal identifiers stay available only in debug or as secondary details.

## Consequences

The interface becomes more understandable and less wrong-confident. Debug mode still exposes implementation details for support.

## Alternatives Considered

Showing both raw and friendly labels everywhere was rejected because it would keep the main UI noisy.
