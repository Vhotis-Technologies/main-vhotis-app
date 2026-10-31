# Seller bulk import (Expo Router)

Planned screens for **CSV import job** UX (start upload, list jobs, show `jobId` progress and errors).

## Wiring

The seller shell is under `app/seller/main/` (drawer). When you implement:

1. Add a drawer screen in `app/seller/main/_layout.tsx` (e.g. `import` stack folder under `main/`), **or** register a sibling stack screen under `app/seller/_layout.tsx`.
2. Add route files here or under `app/seller/main/import/` depending on where you mount the stack.

## Suggested route files (when ready)

| File | Purpose |
|------|---------|
| `index.tsx` | Past import jobs |
| `new.tsx` | Pick CSV / start upload |
| `[jobId].tsx` | Live status + per-row errors |

This folder is intentionally **scaffold-only** so Expo Router does not register incomplete routes.
