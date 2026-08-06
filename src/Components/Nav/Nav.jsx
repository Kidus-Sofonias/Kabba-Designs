import React from "react";
import { Link } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import logo from "../../assets/images/icons/logo.png";
import "./Nav.css";
import { CartIcon } from "../Cart/CartIcon";
import { useTheme } from "../../context/ThemeContext";

function Nav() {
  const { theme, toggle } = useTheme();

  const closeMenu = () => {
    const nav = document.querySelector(".navbar-collapse");
    if (nav.classList.contains("show")) {
      nav.classList.remove("show");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm fixed-top entrance">
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center"
          to="/"
          onClick={closeMenu}
        >
          <img src={logo} alt="KABBA Logo" className="logo me-2" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          <ul className="navbar-nav gap-3 align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/about" onClick={closeMenu}>
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products" onClick={closeMenu}>
                Products
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/events" onClick={closeMenu}>
                Events
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact" onClick={closeMenu}>
                Contact
              </Link>
            </li>
            <li className="nav-item">
              <button
                className="theme-toggle"
                onClick={toggle}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? <FaSun /> : <FaMoon />}
              </button>
            </li>
            <li>
              <Link to="/cart" style={{ marginLeft: 16 }} onClick={closeMenu}>
                <CartIcon />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
