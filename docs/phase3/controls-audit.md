# Phase 3 Controls Audit

Status: baseline before Phase 3 implementation

| Control | Baseline status | Finding | Phase 3 decision |
|---|---|---|---|
| Open PDF | Works fully | File picker opens one PDF. | Keep and add multi-file. |
| Restore pages | Works fully | Restores deleted pages. | Keep. |
| Page row select | Works fully | Selects visible pages. | Keep. |
| Show all / show fewer | Works fully | Large docs expose bounded list. | Keep. |
| Move up/down | Works fully | Reorders page state and export respects it. | Keep and cover in state export. |
| Rotate | Works fully | Queues rotation. | Keep. |
| Delete | Works fully | Deletes unless only one visible page remains. | Keep; add activity/autosave coverage. |
| Export edited PDF | Works fully | Downloads edited PDF. | Keep. |
| TXT/Markdown/HTML | Works partially | Works only after text exists; no copy route. | Keep and add copy/state outputs. |
| Add text to page | Works fully | Adds visible text stamp. | Keep. |
| Form controls | Works fully for detected fields | Values update and validate, but no persistence across reload. | Add autosave/state export. |
| Signature pad/clear/add | Works fully | Visible signature appearance only. | Keep limitation explicit. |
| Extract text | Works fully | Progress/cancel exists. | Keep. |
| OCR page | Works partially | Works but one page at a time; batch OCR is not promised. | Keep, document limitation. |
| Summarize with local model | Works partially | Browser LanguageModel availability is inconsistent; button can confuse users. | Hide when unavailable; show exact availability. |
| Activity log | Works partially | Shows actions but is not persisted. | Persist in active project/state file. |
| Debug panel | Works fully with `?debug=1` | Discoverability is low. | Add Settings toggle. |
| Recent list | Works partially | Metadata only; cannot reopen or clear. | Finish with clear history and active autosave. |

Baseline counts: green 11, yellow 7, red 0.
