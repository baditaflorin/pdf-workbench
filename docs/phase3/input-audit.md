# Phase 3 Input Pathway Audit

Status: updated after Phase 3 implementation

| Input pathway | Baseline status | Final status | Evidence |
|---|---|---|---|
| File picker PDF | Works fully | Green | Single and multi-file picker accepts PDFs and `.pdfwb.json`; smoke test opens a generated PDF. |
| Drag and drop PDF | Not built | Green | Workbench drop zone routes dropped files through the same validated intake path. |
| Paste PDF/file from clipboard | Not built | Green | Global paste handler accepts clipboard files; Paste button uses Clipboard API when allowed and shows a fallback when blocked. |
| Paste project JSON/state | Not built | Green | Pasted archive JSON restores project state through zod validation. |
| URL input | Not built | Out of scope | ADR 0061 keeps arbitrary URL fetch out of scope because GitHub Pages cannot avoid CORS/privacy traps. |
| Mobile file picker | Works partially | Green | Native multi-file input remains the mobile-friendly path; not device-lab verified. |
| Multi-file/batch | Not built | Green | Batch intake records per-file opened/imported/failed status without aborting the whole batch. |
| Sample/demo input | Not built in UI | Green | Sample button creates a real PDF and opens it through normal intake. |
| Imported state file | Not built | Green | `.pdfwb.json` files import via picker, paste, or drop. |
| Restored autosave | Not built | Green | Active project archive is autosaved to IndexedDB and restored on reload when setting is enabled. |
| Deep links/share links | Not built | Out of scope | ADR 0061/0062 reject document-bearing links for privacy and URL-size reasons. |
| Folder input | Not built | Out of scope | ADR 0061 keeps folder picking out of scope for the single-project workbench. |

Before: green 1, yellow 1, red 8, out of scope 3.

After: green 9, yellow 0, red 0, out of scope 3.
