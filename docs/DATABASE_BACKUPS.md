# LeadOS Database Backup & Disaster Recovery Guide

This document outlines the automated daily backup architecture for **AIValytics LeadOS**, the 14-day retention rotation policy, and step-by-step restoration procedures.

---

## 1. Architecture Overview

- **Database Engine**: PostgreSQL 15+ (Hosted on Supabase)
- **Backup Frequency**: Daily at **02:00 UTC** (07:30 IST) via automated cron
- **Retention Period**: **14 Days** (backups older than 14 days are automatically purged)
- **Encryption**: AES-256 (GPG / AWS S3 Server-Side Encryption)
- **Format**: Plain SQL dump (`.sql.gz`) with schema definitions, constraints, sequences, and table data.

---

## 2. Automated Daily Backup (GitHub Action)

The automated backup workflow template is located in [`scripts/db-backup.workflow.yml`](file:///c:/Users/maaza/OneDrive/Desktop/leados/scripts/db-backup.workflow.yml). (To run in GitHub Actions, place this file under `.github/workflows/db-backup.yml` in your repository).

### Workflow Features:
1. Connects to `SUPABASE_DB_URL` (direct PostgreSQL connection string).
2. Executes `pg_dump` with `--clean --if-exists --no-owner --no-privileges`.
3. Compresses the dump into `leados-backup-YYYY-MM-DD_HHMMSS.sql.gz`.
4. Uploads the backup artifact to GitHub Actions / secure cloud storage (S3 / Supabase Storage).
5. Rotates and deletes backup files older than 14 days.

---

## 3. How to Restore a Backup

### Option A: Command-Line Restore via `psql` (Recommended)

When you need to restore LeadOS to a specific point in time or recover deleted records:

#### Step 1: Download & Decompress the Backup File
```bash
# Decompress the 14-day snapshot
gunzip -k leados-backup-2026-11-16_020000.sql.gz
```

#### Step 2: Set the Database Connection String
```bash
export DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

#### Step 3: Run Restoration
```bash
# Restore schema and data into PostgreSQL
psql "$DATABASE_URL" -f leados-backup-2026-11-16_020000.sql
```

> [!IMPORTANT]
> The dump includes `--clean --if-exists`, meaning existing tables will be safely recreated before populating records.
> If restoring to a brand-new staging database, create the database first before running the command.

---

### Option B: Supabase Dashboard Point-In-Time Restore

If using Supabase Pro/Team managed backups:
1. Navigate to **Supabase Dashboard** → **Project Settings** → **Database** → **Backups**.
2. Under **Scheduled Backups**, locate the desired daily snapshot (within the 14-day window).
3. Click **Restore Backup** or choose **Point in Time (PITR)** to restore down to the exact minute.
4. Confirm project restart. The restoration process completes within 2–5 minutes.

---

## 4. Post-Restore Verification Checklist

After running the restore command, execute the following SQL checks to verify database integrity:

```sql
-- 1. Check total lead count
SELECT count(*) AS total_leads FROM leads;

-- 2. Verify recent unassigned leads
SELECT id, full_name, crm_stage, assigned_salesperson, created_at 
FROM leads 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check salesperson daily assignments
SELECT assigned_salesperson, count(*) AS assigned_count 
FROM leads 
WHERE assigned_salesperson IS NOT NULL 
GROUP BY assigned_salesperson;

-- 4. Check sync logs audit trail
SELECT id, source, status, rows_processed, created_at 
FROM sync_logs 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 5. Manual Backup On-Demand

To take a manual backup before performing migrations or major configuration changes:

```bash
# Execute backup script
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
```
This generates a timestamped `.sql.gz` file in `./backups/` and checks for files older than 14 days to purge them.
