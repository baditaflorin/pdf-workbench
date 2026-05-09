# Phase 2 Substance Performance Notes

Baseline date: 2026-05-09

Environment: local Pages build, Apple Silicon development machine, browser-only Mode A.

## Budgets

| Operation | Budget | Result |
|---|---:|---|
| Small PDF open + first-pass classification | <1 s | Pass on the small fixture set |
| Large PDF open + first-pass classification | <5 s | Pass, worst 4.8 s on IRS Publication 17 |
| Text extraction over many pages | Show progress after 300 ms | Implemented |
| Long extraction | Cancellable | Implemented for embedded text; OCR cancellation is best-effort |
| Initial JS payload | <200 KB gzip | Pass: main initial chunk 102.84 KB gzip plus small app chunk 7.33 KB gzip |

## Fixture Prep And Classification Timing

This measures the expensive preconditions of the intelligence engine: reading the real fixture, loading with pdf-lib, sampling up to three pages with pdf.js, and preparing signals for classification.

| Fixture | Result | Pages | Fields | Sample chars | Time |
|---|---|---:|---:|---:|---:|
| 01 W3C dummy | open | 1 | 0 | 14 | 694 ms |
| 02 arXiv paper | open | 15 | 0 | 9,089 | 1,232 ms |
| 03 IRS W-9 | open | 6 | 23 | 21,904 | 299 ms |
| 04 USCIS I-9 | open | 4 | 128 | 10,696 | 861 ms |
| 05 Canada T1261 | encrypted | n/a | n/a | n/a | 15 ms |
| 06 sample invoice | open | 1 | 0 | 442 | 36 ms |
| 07 JFK scan | open | 122 | 0 | 0 | 57 ms |
| 08 IRS Pub 17 | open | 142 | 0 | 12,448 | 4,814 ms |
| 09 Hebrew introductions | open | 2 | 0 | 1,478 | 47 ms |
| 10 truncated W-9 | corrupt | n/a | n/a | n/a | 3 ms |

Median: 299 ms.

p95: 4,814 ms.

Worst: 4,814 ms.

## Hot Paths

1. pdf.js text sampling dominates large tagged PDFs.
2. pdf-lib form parsing dominates field-heavy forms.
3. Browser OCR remains the slowest user-triggered path, especially after worker cold start.

## Follow-Up Candidates

1. Move first-pass sampling to a worker so huge tagged PDFs never occupy the main thread.
2. Cache page text samples by source id in IndexedDB.
3. Add page-range extraction for large publications.
