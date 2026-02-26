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
    console.log("Connected.");

    // course_schedules table
    await c.query(`
        CREATE TABLE IF NOT EXISTS course_schedules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
            start_time VARCHAR(5) NOT NULL,
            end_time VARCHAR(5) NOT NULL,
            room_name VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    console.log("course_schedules OK");

    await c.query("CREATE INDEX IF NOT EXISTS idx_course_schedules_course ON course_schedules(course_id)");
    console.log("indexes OK");

    await c.end();
    console.log("Migration complete.");
}

run().catch(err => { console.error("FAILED:", err.message); process.exit(1); });
