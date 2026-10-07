require("dotenv").config();

const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const result = await client.query(`
    SELECT id, name, email, role
    FROM public."user"
    ORDER BY id;
  `);

  console.table(result.rows);

  await client.end();
}

main().catch(console.error);
