# 0008 - Go Backend Layout

## Status

Accepted

## Context

The bootstrap requires Go layout only for Modes B and C.

## Decision

Skip the Go backend in v1 because the selected deployment mode is pure GitHub Pages.

## Consequences

No `cmd/`, `internal/`, `pkg/`, `api/`, or Docker server layout is created. If a future native-processing backend is added, it must start with a new ADR and follow the required Go layout.

## Alternatives Considered

A local-only Go CLI helper was considered but would break the "works from Pages" v1 promise.
