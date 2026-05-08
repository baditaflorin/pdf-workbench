# 0014 - Error Handling Conventions

## Status

Accepted

## Context

PDF parsing, browser storage, OCR, and file download can all fail.

## Decision

Async feature services return typed results or throw `Error` objects with user-safe messages. React catches failures at action boundaries and shows a global toast or inline panel. Error messages must not include document content.

## Consequences

The UI stays understandable without exposing private data.

## Alternatives Considered

Swallowing failures and only logging to the console was rejected because users need export confidence.
