const { loginUser } = require("./auth.service");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
}

module.exports = {
  login,
};