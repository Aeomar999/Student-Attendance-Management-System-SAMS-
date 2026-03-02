const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_CBRgmQhM9T7i@ep-round-mud-aijt0ht5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&uselibpqcompat=true"
  });
  await client.connect();
  
  const code = 'CS102';
  const name = 'Intro2';
  const description = "";
  
  const depts = await client.query("SELECT id, institution_id FROM departments LIMIT 1");
  if (depts.rows.length === 0) throw new Error("no depts");
  const dept = depts.rows[0];
  const departmentId = dept.id;
  const institutionId = dept.institution_id;
  const lecturerId = null;
  const creditHours = 3;
  
  console.log("Using dept:", departmentId, "inst:", institutionId);
  try {
     const result = await client.query(`
                INSERT INTO courses (code, name, description, department_id, institution_id, lecturer_id, credit_hours, status)
                VALUES ($1,$2,$3,$4,$5,$6,$7,'ACTIVE')
                RETURNING id, code, name, status
            `, [code, name, description, departmentId, institutionId, lecturerId, creditHours]);
     console.log("Success:", result.rows);
  } catch (err) {
     console.error("DB error:", err);
  }
  await client.end();
}

main().catch(console.error);
