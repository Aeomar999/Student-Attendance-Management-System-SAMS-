/**
 * One-time migration: creates courses and course_enrollments tables.
 * Run with: npx ts-node --project tsconfig.json migrate-courses.ts
 */
import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL!,
        ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    console.log("Connected. Running migration...");

    await client.query(`
        CREATE TABLE IF NOT EXISTS courses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR(20) UNIQUE NOT NULL,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            department_id VARCHAR(100) NOT NULL DEFAULT 'DEPT-CS',
            institution_id VARCHAR(100) NOT NULL DEFAULT 'INST-001',
            lecturer_id UUID REFERENCES users(id) ON DELETE SET NULL,
            credit_hours INT DEFAULT 3,
            status VARCHAR(20) DEFAULT 'ACTIVE',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);
    console.log("✓ courses table created");

    await client.query(`
        CREATE TABLE IF NOT EXISTS course_enrollments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            enrolled_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(course_id, student_id)
        );
    `);
    console.log("✓ course_enrollments table created");

    await client.query(`
        CREATE INDEX IF NOT EXISTS idx_courses_lecturer ON courses(lecturer_id);
        CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
        CREATE INDEX IF NOT EXISTS idx_enrollments_student ON course_enrollments(student_id);
    `);
    console.log("✓ indexes created");

    await client.end();
    console.log("Migration complete.");
}

migrate().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
