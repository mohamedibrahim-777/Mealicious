#!/bin/sh
set -e

mkdir -p /app/db

echo "[entrypoint] Applying Prisma schema..."
bunx prisma db push --skip-generate --accept-data-loss || echo "[entrypoint] schema push failed"

echo "[entrypoint] Running seed (upserts; idempotent)..."
bun /app/prisma/seed.ts || echo "[entrypoint] seed failed (continuing)"

echo "[entrypoint] Starting Next.js standalone server..."
exec bun server.js
