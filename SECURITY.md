# Security Policy

PDF Workbench is designed to keep documents in the user's browser.

## Reporting

Please report security issues by email to florin@badita.net.

Do not open a public issue for vulnerabilities involving document handling, dependency supply chain risk, or accidental data exposure.

## Scope

- Static frontend at https://baditaflorin.github.io/pdf-workbench/
- Browser-side PDF processing, OCR, storage, and export flows
- Local git hooks and release scripts

## Secrets

No secrets belong in this repository or in the frontend. Use `.env.example` for placeholders only.
