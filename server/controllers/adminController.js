const jwt = require("jsonwebtoken");

exports.loginAdmin = (req, res) => {
  const { email, password } = req.body;

  const presetEmail = process.env.ADMIN_EMAIL;
  const presetPassword = process.env.ADMIN_PASSWORD;

  if (email === presetEmail && password === presetPassword) {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d", // 7 days — admin stays logged in for a week
    });
    return res.json({ token });
  } else {
    return res.status(401).json({ error: "Invalid credentials" });
  }
};
