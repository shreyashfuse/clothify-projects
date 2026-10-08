const { getDashboardStats } = require("./dashboard.service");

async function getDashboard(req, res) {
  try {
    const stats = await getDashboardStats();

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Dashboard error:", error);
    console.error("Dashboard error message:", error.message);

    return res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
}

module.exports = {
  getDashboard,
};