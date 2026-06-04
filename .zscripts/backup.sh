#!/usr/bin/env bash
# Daily PostgreSQL backup for Mealicious — pg_dump from the DB container,
# gzip, rotate keeping last 7 days. Run via cron (see install note at bottom).
set -euo pipefail

DB_CONTAINER="mealicious-db"
DB_USER="mealicious"
DB_NAME="mealicious"
BACKUP_DIR="/var/backups/mealicious"
RETENTION_DAYS=7
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTFILE="${BACKUP_DIR}/mealicious_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Dump from inside the DB container (avoids needing pg_dump on host)
if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists \
  | gzip > "$OUTFILE"; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') backup OK: $OUTFILE ($(du -h "$OUTFILE" | cut -f1))"
else
  echo "$(date '+%Y-%m-%d %H:%M:%S') backup FAILED" >&2
  rm -f "$OUTFILE"
  exit 1
fi

# Rotate — delete backups older than RETENTION_DAYS
find "$BACKUP_DIR" -name 'mealicious_*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete

# Restore command (manual):
#   gunzip -c <file>.sql.gz | docker exec -i mealicious-db psql -U mealicious -d mealicious
