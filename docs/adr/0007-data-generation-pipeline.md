# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

Mode B would require a data generator. Mode A does not.

## Decision

No data generation pipeline is included in v1. `make data` is intentionally omitted because there are no static datasets.

## Consequences

The repository stays smaller and the deployment path is a plain static build.

## Alternatives Considered

Shipping sample PDFs or generated fixtures as public artifacts was rejected to avoid binary churn and accidental licensing confusion.
