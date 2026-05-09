# 0066 Error Handling Convention

## Status

Accepted

## Decision

All PDF/user workflow errors crossing into production UI use `PdfUserError`: title, what, why, next step, recoverability, and optional debug detail. New archive, paste, clipboard, storage, and import errors follow this shape.

## Consequences

Users receive actionable next steps instead of implementation errors.
