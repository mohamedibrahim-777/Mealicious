#!/bin/sh
set -e

echo "[entrypoint] Applying Prisma schema to Postgres..."
bunx prisma@6.19.2 db push --accept-data-loss --skip-generate || echo "[entrypoint] schema push failed"

echo "[entrypoint] Running seed (upserts; idempotent)..."
bun /app/prisma/seed.ts || echo "[entrypoint] seed failed (continuing)"

echo "[entrypoint] Starting Next.js standalone server..."
exec bun server.js
