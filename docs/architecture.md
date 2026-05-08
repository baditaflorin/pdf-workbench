# Architecture

Live site: https://baditaflorin.github.io/pdf-workbench/

Repository: https://github.com/baditaflorin/pdf-workbench

## Context

```mermaid
C4Context
  title PDF Workbench Context
  Person(user, "Knowledge worker", "Edits PDFs, fills forms, signs, OCRs scanned pages")
  System_Boundary(browser, "User browser") {
    System(app, "PDF Workbench", "Static GitHub Pages app")
    SystemDb(storage, "IndexedDB", "Recent project metadata")
  }
  System_Ext(github, "GitHub", "Repository, Pages hosting, public commit metadata")
  System_Ext(paypal, "PayPal", "Support link")
  Rel(user, app, "Uses locally")
  Rel(app, storage, "Stores small metadata")
  Rel(app, github, "Fetches public latest commit")
  Rel(user, github, "Stars repository")
  Rel(user, paypal, "Supports maintainer")
```

## Container

```mermaid
flowchart LR
  subgraph gh["GitHub"]
    repo["baditaflorin/pdf-workbench"]
    pages["GitHub Pages /pdf-workbench/"]
  end

  subgraph browser["User browser boundary"]
    shell["React/Vite shell"]
    pdf["PDF feature services"]
    render["pdf.js renderer"]
    mutate["pdf-lib exporter"]
    ocr["Tesseract.js OCR"]
    ai["Browser-local LanguageModel API"]
    idb["IndexedDB metadata"]
  end

  repo --> pages
  pages --> shell
  shell --> pdf
  pdf --> render
  pdf --> mutate
  pdf --> ocr
  pdf --> ai
  pdf --> idb
```

## Module Boundaries

- `src/features/pdf/` owns document state, PDF parsing/export, OCR, forms, text stamping, signature appearance, and text conversion.
- `src/features/project/` owns public project metadata, GitHub commit display, repository link, and PayPal link.
- `src/lib/` owns browser storage, download helpers, and shared error utilities.
- `docs/` is generated Pages output and is committed intentionally.

There is no runtime backend in v1.
