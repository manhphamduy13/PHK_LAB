# Storage Deployment

## Local development

`LocalStorageProvider` stores files beneath `STORAGE_ROOT`, defaulting to `uploads/`. The API stores a generated `storageKey` in the documents table and never trusts the original filename as a path.

## Render controlled deployment

The current `ProductionStorageProvider` uses the Render persistent disk configured by `render.yaml`:

```text
STORAGE_ROOT=/var/data/uploads
```

The disk is mounted at `/var/data`. This is suitable for a single Web Service controlled deployment and must be verified with an upload, process, restart, and existence test. It is not shared across multiple service instances.

## Provider contract

`StorageProvider` exposes:

- `upload(key, data, metadata)`
- `download(key)`
- `delete(key)`
- `exists(key)`
- `getUrl(key)`
- `getMetadata(key)`

The current filesystem implementation also stores sidecar metadata JSON and validates path traversal in storage keys.

## Future object storage

For scale or multiple instances, replace only the production provider with S3-compatible storage, Cloudflare R2, or another object-storage adapter. Keep the database record as metadata plus a storage key; do not store large PDF binaries in PostgreSQL. Suggested future variables are `STORAGE_PROVIDER`, `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, and `STORAGE_SECRET_KEY`. Do not add real values to `.env.example`.

## Current status

Local provider behavior is source-verified. Render disk durability and PDF restart persistence remain **BLOCKED — requires Render deployment test**.
