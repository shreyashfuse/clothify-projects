require("dotenv").config();

const { Client } = require("pg");
const bcrypt = require("bcryptjs");

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const passwordHash = await bcrypt.hash("Clothify@123", 10);

  await client.query(
    `UPDATE public."user"
     SET password = $1, "updatedAt" = NOW()
     WHERE email = $2`,
    [passwordHash, "owner@clothify.com"]
  );

  console.log("Owner password reset successfully.");
  console.log("Email: owner@clothify.com");
  console.log("Password: Clothify@123");

  await client.end();
}

main().catch(console.error);