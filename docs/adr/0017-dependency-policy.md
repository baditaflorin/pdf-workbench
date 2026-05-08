# 0017 - Dependency Policy

## Status

Accepted

## Context

The app processes sensitive documents and relies on browser PDF/OCR libraries.

## Decision

Use production-ready, actively maintained dependencies. Pin dependency versions through `package-lock.json`. Run `npm audit` before release. Add new dependencies only when they replace nontrivial custom logic or materially improve reliability.

## Consequences

The project avoids bespoke PDF parsing and OCR code while retaining a reviewable supply chain.

## Alternatives Considered

Hand-rolled PDF object manipulation was rejected as too risky.
