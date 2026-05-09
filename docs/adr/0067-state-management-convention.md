# 0067 State Management Convention

## Status

Accepted

## Decision

React owns current in-memory UI state. IndexedDB owns recent metadata, active project autosave, and user settings. Downloaded `.pdfwb.json` owns portable project state.

## Consequences

Reload and tab-close recovery are possible without introducing accounts or a backend.
