# 0047 Error Taxonomy

## Status

Accepted

## Context

The audit found raw `PDFDocument.load` and parser-offset messages in user-visible UI.

## Decision

Errors crossing UI boundaries become `PdfUserError` objects with `kind`, `title`, `what`, `why`, `nextStep`, `recoverable`, and optional technical detail for debug mode. Known kinds include encrypted PDF, corrupt PDF, unsupported PDF feature, empty text, OCR unavailable, cancelled, and unknown failure.

## Consequences

Users get next steps and keep their work when errors are recoverable. Developers still have details in debug mode.

## Alternatives Considered

Keeping generic `Error.message` display was rejected because it fails the "what/why/now what" rule.
