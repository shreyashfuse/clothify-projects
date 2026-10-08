const db = require("./src/config/database");

const query = db.raw.sql(
  'SELECT id, name, email, role FROM "user" ORDER BY id'
);

const prepared = db.prepare(query);

console.log(prepared);
console.log("Methods:", Object.keys(prepared));