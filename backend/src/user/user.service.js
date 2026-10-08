const bcrypt = require("bcryptjs");
const db = require("../config/database");
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
  const user = await db.orm.public.User
    .where({ id: Number(id) })
    .first();
  if (!user) return null;
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.branchId !== undefined) {
    updateData.branchId = data.branchId || null;
  }
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }
  updateData.updatedAt = new Date();
  const updatedUser = await db.orm.public.User.update(
    { id: Number(id) },
    updateData
  );
  return sanitizeUser(updatedUser);
}
async function deleteUser(id) {
  const user = await db.orm.public.User
    .where({ id: Number(id) })
    .first();
  if (!user) return null;
  const deletedUser = await db.orm.public.User.delete({
    id: Number(id),
  });
  return sanitizeUser(deletedUser);
}
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
