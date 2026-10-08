const userService = require("./user.service");

// Get all users
async function getUsers(req, res) {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
}

// Add new user
async function addUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    // Managers can only create CASHIER users
if (req.user.role === "MANAGER" && role !== "CASHIER") {
  return res.status(403).json({
    message: "Managers can only create CASHIER users",
  });
}

    // Required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    // Valid roles
    const validRoles = ["OWNER", "MANAGER", "CASHIER"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Use OWNER, MANAGER or CASHIER",
      });
    }

    const user = await userService.createUser(req.body);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Add user error:", error);

    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
}

// Edit user
async function editUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Required fields
    if (!name || !email || !role) {
      return res.status(400).json({
        message: "Name, email and role are required",
      });
    }

    // Valid roles
    const validRoles = ["OWNER", "MANAGER", "CASHIER"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Use OWNER, MANAGER or CASHIER",
      });
    }

    const user = await userService.updateUser(id, req.body);

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Edit user error:", error);

    res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
}

// Remove user
async function removeUser(req, res) {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Remove user error:", error);

    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
}

module.exports = {
  getUsers,
  addUser,
  editUser,
  removeUser,
};