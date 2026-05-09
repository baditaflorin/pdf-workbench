# PDF Workbench

![Version](https://img.shields.io/badge/version-0.3.0-143f4a)
![Deployment](https://img.shields.io/badge/deploy-GitHub%20Pages-2f6f7a)
![Mode](https://img.shields.io/badge/mode-local--first-c46534)

Live site: https://baditaflorin.github.io/pdf-workbench/

Repository: https://github.com/baditaflorin/pdf-workbench

Support: https://www.paypal.com/paypalme/florinbadita

PDF Workbench is a privacy-first browser PDF toolkit for editing, OCR, forms, conversion, and signing without an Acrobat subscription.

![PDF Workbench demo](https://baditaflorin.github.io/pdf-workbench/demo.png)

## Features

- Open PDFs locally in the browser; no upload path.
- Reorder, rotate, delete, and export pages.
- Fill detected AcroForm text, checkbox, dropdown, option list, and radio fields.
- Add text stamps and visible signature appearances.
- Extract embedded text, OCR rendered pages with Tesseract.js, copy text, and export TXT/Markdown/HTML.
- Save a versioned `.pdfwb.json` project state file and re-import it later.
- Autosave the active project locally in IndexedDB, with clear project/history controls.
- Drag/drop, multi-file intake, clipboard paste, and a generated sample PDF all use the same local intake path.
- Show version, latest public GitHub commit, repository link, and PayPal support link in the app.

## Quickstart

```bash
npm install
make install-hooks
make dev
make build
make smoke
```

## Architecture

```mermaid
flowchart LR
  user["User browser"] --> pages["GitHub Pages static app"]
  pages --> idb["IndexedDB active project / settings / recent metadata"]
  pages --> wasm["Lazy PDF/OCR/AI modules"]
  pages --> github["GitHub public API for commit metadata"]
```

Mode A keeps every PDF local to the browser. There is no runtime backend and no document upload path.

## Docs

Architecture: docs/architecture.md

Deployment: docs/deploy.md

Privacy: docs/privacy.md

ADRs: docs/adr/

Postmortem: docs/postmortem.md

Phase 2 postmortem: docs/postmortem-phase2-substance.md

Phase 3 postmortem: docs/postmortem-phase3.md
