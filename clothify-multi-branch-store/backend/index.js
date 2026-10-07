const userRoutes = require("./src/user/user.routes");
globalThis.Temporal = require("@js-temporal/polyfill").Temporal;

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/auth/auth.routes");
const dashboardRoutes = require("./src/dashboard/dashboard.routes");
const customerRoutes = require("./src/customer/customer.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/users", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Clothify backend is running",
  });
});

const { authorizeRoles } = require("./src/auth/auth.role.middleware");
const { authenticateToken } = require("./src/auth/auth.middleware");

app.get(
  "/api/owner-test",
  authenticateToken,
  authorizeRoles("OWNER"),
  (req, res) => {
    res.json({
      message: "You accessed an OWNER-only route",
      user: req.user,
    });
  }
);

app.get("/api/protected-test", authenticateToken, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Clothify backend running on http://localhost:${PORT}`);
});


