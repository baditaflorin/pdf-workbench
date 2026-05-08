# 0009 - Configuration and Secrets Management

## Status

Accepted

## Context

The frontend must not contain secrets. Mode A should need none.

## Decision

All public constants are injected at build time through Vite `define`. `.env*` files are gitignored except `.env.example`. The app uses no private API keys, OAuth secrets, or server credentials.

## Consequences

The production site is safe to inspect and fork. Any future feature requiring a secret must be implemented outside the frontend or deferred.

## Alternatives Considered

Encrypted client secrets and obfuscated keys were rejected because they are still secrets in the frontend.
