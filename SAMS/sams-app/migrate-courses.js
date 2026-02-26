/* eslint-disable @typescript-eslint/no-require-imports, no-console */
const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

async function run() {
    const c = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await c.connect();
    console.log("Connected to Neon.");

    await c.query(`
        CREATE TABLE IF NOT EXISTS courses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR(20) UNIQUE NOT NULL,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            department_id VARCHAR(100) NOT NULL DEFAULT 'DEPT-CS',
            institution_id VARCHAR(100) NOT NULL DEFAULT 'INST-001',
            lecturer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
            credit_hours INT DEFAULT 3,
            status VARCHAR(20) DEFAULT 'ACTIVE',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    console.log("courses table OK");

    await c.query(`
        CREATE TABLE IF NOT EXISTS course_enrollments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            enrolled_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(course_id, student_id)
        )
    `);
    console.log("course_enrollments table OK");

    await c.query("CREATE INDEX IF NOT EXISTS idx_courses_lecturer ON courses(lecturer_id)");
    await c.query("CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id)");
    await c.query("CREATE INDEX IF NOT EXISTS idx_enrollments_student ON course_enrollments(student_id)");
    console.log("indexes OK");

    await c.end();
    console.log("Migration complete.");
}

run().catch(err => { console.error("FAILED:", err.message); process.exit(1); });
