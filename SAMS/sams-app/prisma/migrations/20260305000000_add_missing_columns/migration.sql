-- AddColumn: grace_period to attendance_sessions
ALTER TABLE "attendance_sessions"
    ADD COLUMN IF NOT EXISTS "grace_period" INTEGER NOT NULL DEFAULT 15;

-- AddColumn: manual_reason to attendance_records
ALTER TABLE "attendance_records"
    ADD COLUMN IF NOT EXISTS "manual_reason" TEXT;

-- AddColumn: credit_hours to courses (was in schema but missing from initial migration)
ALTER TABLE "courses"
    ADD COLUMN IF NOT EXISTS "credit_hours" INTEGER NOT NULL DEFAULT 3;

-- AddColumn: details to audit_logs (was in schema but missing from initial migration)
ALTER TABLE "audit_logs"
    ADD COLUMN IF NOT EXISTS "details" TEXT;
