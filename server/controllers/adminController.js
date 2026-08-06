const jwt = require("jsonwebtoken");

exports.loginAdmin = (req, res) => {
  const { email, password } = req.body;

  const presetEmail = process.env.ADMIN_EMAIL;
  const presetPassword = process.env.ADMIN_PASSWORD;

  if (email === presetEmail && password === presetPassword) {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: 43200, // 12 hours in seconds
    });
    return res.json({ token });
  } else {
    return res.status(401).json({ error: "Invalid credentials" });
  }
};
