import React from "react";
import { useNavigate } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin");
  };

  return (
    <nav className="navbar navbar-dark mb-4 px-4 justify-content-between glass">
      <span className="navbar-brand">Admin Dashboard</span>
      <button className="btn btn-outline-danger" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default AdminNavbar;
