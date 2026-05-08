# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A has no generated datasets, but the frontend needs public project metadata.

## Decision

There is no committed static data pipeline in v1. Runtime public metadata is limited to the GitHub public commits API for the latest `main` commit. Build metadata is injected by Vite constants:

- `__APP_VERSION__`
- `__COMMIT_SHA__`
- `__REPO_URL__`
- `__PAYPAL_URL__`

## Consequences

The app works without GitHub API access and falls back to build metadata. No secrets or API tokens are used.

## Alternatives Considered

A generated `docs/data/build.json` file was considered, but Vite constants plus the public commits API keep the contract smaller.
