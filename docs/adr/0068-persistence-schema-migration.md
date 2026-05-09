# 0068 Persistence Schema And Migration Policy

## Status

Accepted

## Decision

Persisted active projects use archive schema `pdf-workbench.project.v1`. Settings use `pdf-workbench.settings.v1`. Future breaking changes must add a migration or show an export/reimport recovery message.

## Consequences

Old metadata-only IndexedDB users keep their recent list; active project restore starts from Phase 3 onward.
