import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/admin/login", { email, password });
      localStorage.setItem("token", data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container py-5">
      <h3 className="mb-4 text-center">Admin Login</h3>
      <form onSubmit={handleLogin} className="col-md-6 mx-auto">
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-warning w-100" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
