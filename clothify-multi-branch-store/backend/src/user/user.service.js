const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const db = require("../config/database");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
function sanitizeUser(user) {
  if (!user) return user;

  const { password, ...safeUser } = user;

  return safeUser;
}

async function getAllUsers() {
  const users = await db.orm.public.User.all();

  return users.map(sanitizeUser);
}

async function getUserById(id) {
  const user = await db.orm.public.User
    .where({ id: Number(id) })
    .first();

  return sanitizeUser(user);
}

async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await db.orm.public.User.create({
  name: data.name,
  email: data.email,
  password: hashedPassword,
  role: data.role,
  branchId: data.branchId || null,
  updatedAt: new Date(),
});

  return sanitizeUser(user);
}

async function updateUser(id, data) {
  const fields = [];
  const values = [];
  let index = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(data.name);
  }

  if (data.email !== undefined) {
    fields.push(`email = $${index++}`);
    values.push(data.email);
  }

  if (data.role !== undefined) {
    fields.push(`role = $${index++}`);
    values.push(data.role);
  }

  if (data.branchId !== undefined) {
    fields.push(`"branchId" = $${index++}`);
    values.push(data.branchId || null);
  }

  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    fields.push(`password = $${index++}`);
    values.push(hashedPassword);
  }

  if (fields.length === 0) {
    return await getUserById(id);
  }

  fields.push(`"updatedAt" = NOW()`);

  values.push(Number(id));

  const result = await pool.query(
    `UPDATE "user"
     SET ${fields.join(", ")}
     WHERE id = $${index}
     RETURNING id, name, email, role, "branchId", "createdAt", "updatedAt"`,
    values
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function deleteUser(id) {
  const result = await pool.query(
    `DELETE FROM "user"
     WHERE id = $1
     RETURNING id, name, email, role, "branchId", "createdAt", "updatedAt"`,
    [Number(id)]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}


module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};