const express = require("express");
const cors = require("cors");
const branchRoutes = require("./routes/branchRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const authRoutes = require("./src/auth/auth.routes");
const userRoutes = require("./src/user/user.routes");
const customerRoutes = require("./src/customer/customer.routes");
const dashboardRoutes = require("./src/dashboard/dashboard.routes");
const app = express();
const PORT = 5000;
// Middleware
app.use(cors());
app.use(express.json());
// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Clothify Backend is running successfully!",
  });
});
// Existing POS routes
app.use("/api/branches", branchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
// New modules
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
// Start server
app.listen(PORT, () => {
  console.log(`Clothify Backend running on http://localhost:${PORT}`);
});
