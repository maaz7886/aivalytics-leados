#!/usr/bin/env bash
# scripts/backup-db.sh
# AIValytics LeadOS — Automated Database Backup with 14-Day Retention

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS=14
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/leados-backup-${TIMESTAMP}.sql"
GZ_FILE="${BACKUP_FILE}.gz"

mkdir -p "${BACKUP_DIR}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL environment variable is not set."
  echo "Usage: DATABASE_URL='postgresql://...' ./scripts/backup-db.sh"
  exit 1
fi

echo "=========================================="
echo "Starting LeadOS Database Backup at ${TIMESTAMP}"
echo "=========================================="

# 1. Run pg_dump with clean, schema, data and sequences
pg_dump "${DATABASE_URL}" \
  --format=plain \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --file="${BACKUP_FILE}"

# 2. Compress the dump
gzip -9 "${BACKUP_FILE}"

echo "✓ Backup created successfully: ${GZ_FILE} ($(du -h "${GZ_FILE}" | cut -f1))"

# 3. Purge backups older than 14 days
echo "Checking for snapshots older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "leados-backup-*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm -v {} \;

echo "✓ 14-day backup rotation complete."
