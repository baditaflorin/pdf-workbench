# 0063 Half-Baked Feature Triage

## Status

Accepted

## Decision

| Feature | Decision | Rationale |
|---|---|---|
| Recent history | Finish | It implied continuity but did not restore work. |
| Activity log | Finish | It becomes useful when persisted and included in state export. |
| Debug panel | Finish | Add a setting so users can discover it without remembering `?debug=1`. |
| Local AI summary | Finish/hide | Keep only when browser support exists; otherwise show an availability note. |
| URL import/share link | Permanently out of scope | Conflicts with privacy and static hosting constraints. |
| State round-trip | Finish | Required for real work. |

## Consequences

No production control remains as a placeholder.
