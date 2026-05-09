# 0061 Input Pathway Coverage Policy

## Status

Accepted

## Context

Users expect picker, drag/drop, paste, sample, and restore flows. URL/folder/share-link ingestion is either unsafe or outside the local-only product shape.

## Decision

Support PDF files and project-state files through picker, drag/drop, paste, and sample load. Multi-file intake records per-file status and opens the first successful project. URL import, folder import, and document-bearing share links are out of scope.

## Consequences

Inputs are predictable and private. CORS and sensitive-document leakage are avoided.

## Alternatives Considered

A public CORS proxy was rejected because it would route private PDFs through infrastructure outside the user's browser.
