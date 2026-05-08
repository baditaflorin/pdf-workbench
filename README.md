# PDF Workbench

Live site: https://baditaflorin.github.io/pdf-workbench/

Repository: https://github.com/baditaflorin/pdf-workbench

Support: https://www.paypal.com/paypalme/florinbadita

PDF Workbench is a privacy-first browser PDF toolkit for editing, OCR, forms, conversion, and signing without an Acrobat subscription.

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
  pages --> idb["IndexedDB / OPFS"]
  pages --> wasm["Lazy PDF/OCR/AI modules"]
  pages --> github["GitHub public API for commit metadata"]
```

Mode A keeps every PDF local to the browser. There is no runtime backend and no document upload path.

## Docs

Architecture: docs/architecture.md

Deployment: docs/deploy.md

ADRs: docs/adr/

Postmortem: docs/postmortem.md
