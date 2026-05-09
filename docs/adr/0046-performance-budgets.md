# 0046 Performance Budgets

## Status

Accepted

## Context

The 142-page publication and 122-page scan expose v1 scale assumptions. Operations over 300 ms need visible progress; operations over 5 s should be cancellable when feasible.

## Decision

Opening and first-pass analysis should stay under 1 second for small PDFs and under 5 seconds for the large fixture on a typical developer machine. Text extraction reports progress by page and supports cancellation. Page lists show a bounded preview for large documents instead of forcing the DOM to render every page row.

## Consequences

The UI remains responsive and honest for large files. Full OCR cancellation remains limited by Tesseract.js capabilities, so the app cancels stale UI updates and exposes the limitation.

## Alternatives Considered

Doing all extraction automatically on upload was rejected for large documents because it would surprise users and block work.
