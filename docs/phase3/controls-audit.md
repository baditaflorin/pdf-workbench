# Phase 3 Controls Audit

Status: updated after Phase 3 implementation

| Control | Baseline status | Final status | Evidence |
|---|---|---|---|
| Open PDF or state | Works fully | Green | Opens PDFs, project state files, and multi-file batches. |
| Sample | Not built | Green | Generates a real sample PDF and opens it through intake. |
| Paste | Not built | Green | Uses Clipboard API where supported and explains blocked permissions. |
| Save state | Not built | Green | Downloads `.pdfwb.json` with version and commit metadata. |
| Start fresh / Clear project | Not built | Green | Clears current project, autosaved archive, transient errors, AI summary, and batch results. |
| Batch intake list | Not built | Green | Shows per-file results for multi-file input. |
| Restore pages | Works fully | Green | Restores deleted pages. |
| Page row select | Works fully | Green | Selects visible pages. |
| Show all / show fewer | Works fully | Green | Large docs expose bounded list. |
| Move up/down | Works fully | Green | Reorders page state and export/state archive respects it. |
| Rotate | Works fully | Green | Queues rotation and persists through state export/import. |
| Delete | Works fully | Green | Destructive confirmation is controlled by Settings. |
| Export edited PDF | Works fully | Green | Downloads edited PDF. |
| State / Print | Not built | Green | Project state download and print action are wired. |
| TXT/Markdown/HTML/Copy | Works partially | Green | Downloads remain and clipboard copy is wired. |
| Add text to page | Works fully | Green | Adds visible text stamp and persists in state archive. |
| Form controls | Works fully for detected fields | Green | Values persist through autosave and state export/import. |
| Signature pad/clear/add | Works fully | Green | Visible signature appearance persists in state archive. |
| Extract text | Works fully | Green | Progress/cancel remains. |
| OCR page | Works partially | Green | Single-page OCR remains the explicit scope and persists in state archive. |
| Summarize with local model | Works partially | Green | Button is disabled when browser-local model is unavailable and guidance is shown. |
| Settings toggles | Not built | Green | Autosave, debug panel, and destructive confirmation all change behavior and persist. |
| Activity log | Works partially | Green | Activity persists in autosave/state archive. |
| Debug panel | Works fully with `?debug=1` | Green | Also exposed through a persisted Settings toggle. |
| Recent list / Clear recent | Works partially | Green | Recent metadata is visible and clearable; project restoration is handled by active autosave/state files. |

Before: green 11, yellow 7, red 0.

After: green 25, yellow 0, red 0.
