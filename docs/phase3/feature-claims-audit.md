# Phase 3 Feature Claims Audit

Status: baseline before Phase 3 implementation

| Claim source | Claim | Baseline status | Finding | Phase 3 decision |
|---|---|---|---|---|
| README | Open PDFs locally; no upload path | Shipped fully | True. | Keep and test. |
| README | Reorder, rotate, delete, export pages | Shipped fully | True. | Keep and test. |
| README | Fill detected AcroForm fields | Shipped fully | True for AcroForms; XFA restrictions explained by Phase 2. | Keep limitation. |
| README | Add text stamps and visible signature appearances | Shipped fully | True. | Keep. |
| README | Extract embedded text, OCR pages, export TXT/Markdown/HTML | Shipped fully | True, but no copy/state export. | Add output completeness. |
| README | Show version/latest commit/repo/PayPal links | Shipped fully | True, badge version is stale at 0.1.0. | Fix README badge. |
| Privacy doc | Stores only recent metadata | Shipped partially | Phase 3 will intentionally persist active project locally. | Update docs after implementation. |
| Architecture doc | IndexedDB metadata only | Shipped partially | Same as privacy doc. | Update docs. |
| In-app | Recent project history | Shipped partially | Recent cannot reopen anything. | Finish or make honest. |
| In-app | Local AI summary | Shipped partially | Availability depends on browser; current UI does not say that clearly. | Hide/clarify. |

Baseline mismatches: README badge, privacy storage, architecture storage, recent history behavior, local AI availability.
