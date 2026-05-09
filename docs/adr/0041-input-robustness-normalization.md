# 0041 Input Robustness And Normalization

## Status

Accepted

## Context

PDF inputs arrive as clean text, form-heavy PDFs, image-only scans, malformed/truncated files, encrypted/restricted documents, huge publications, mixed-language content, and odd metadata.

## Decision

Boundary code will normalize to a small `PdfIntelligence` signal model: file name, byte size, page count, form count, extracted sample text, parser error kind, and field signals. Text normalization collapses whitespace while preserving script detection. Errors are classified before display. Large-document thresholds are 100 pages or 5 MB.

## Consequences

The app can make a first-pass decision before asking the user to configure anything. Some PDF internals remain inaccessible in-browser; those cases become classified recoverable failures rather than raw crashes.

## Alternatives Considered

Adding a backend repair pipeline was rejected because Phase 2 cannot change Mode A.
