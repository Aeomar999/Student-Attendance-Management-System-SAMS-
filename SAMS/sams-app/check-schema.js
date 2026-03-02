const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_CBRgmQhM9T7i@ep-round-mud-aijt0ht5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&uselibpqcompat=true"
  });
  await client.connect();
  const res = await client.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'courses'");
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);
