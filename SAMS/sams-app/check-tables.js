const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_CBRgmQhM9T7i@ep-round-mud-aijt0ht5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&uselibpqcompat=true"
  });
  await client.connect();
  
  try {
     const res1 = await client.query("SELECT * FROM course_schedules LIMIT 1");
     console.log("course_schedules exists");
  } catch(e) { console.log(e.message) }
  try {
     const res1 = await client.query("SELECT * FROM schedules LIMIT 1");
     console.log("schedules exists");
  } catch(e) { console.log(e.message) }
  
  await client.end();
}

main().catch(console.error);
