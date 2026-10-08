const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

async function loginUser(email, password) {
  // 1. Validate input
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // 2. Find user by email
  const user = await db.orm.public.User
    .where({ email })
    .first();

  // 3. Check if user exists
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 4. Compare entered password with hashed password
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  // 5. Get JWT secret
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  // 6. Create JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      branchId: user.branchId,
    },
    jwtSecret,
    {
      expiresIn: "1d",
    }
  );

  // 7. Return login response
  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    },
  };
}

module.exports = {
  loginUser,
};