import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import logo from "../../assets/images/icons/logo.png";
import "./Nav.css";
import { CartIcon } from "../Cart/CartIcon";
import { useTheme } from "../../context/ThemeContext";

function Nav() {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Track scroll for navbar background opacity
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { to: "/about", label: "About" },
    { to: "/products", label: "Products" },
    { to: "/events", label: "Events" },
    { to: "/track-order", label: "Track Order" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`kabba-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="kabba-nav-inner">
          {/* Logo */}
          <Link to="/" className="kabba-nav-logo">
            <img src={logo} alt="KABBA" className="kabba-nav-logo-img" />
          </Link>

          {/* Desktop links */}
          <div className="kabba-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`kabba-nav-link ${isActive(link.to) ? "active" : ""}`}
              >
                {link.label}
                {isActive(link.to) && <span className="kabba-nav-underline" />}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="kabba-nav-actions">
            <button
              className="kabba-theme-toggle"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>

            <Link to="/cart" className="kabba-nav-cart">
              <CartIcon />
            </Link>

            {/* Hamburger */}
            <button
              className={`kabba-hamburger ${mobileOpen ? "open" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      <div
        className={`kabba-mobile-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={`kabba-mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="kabba-mobile-drawer-header">
          <Link to="/" className="kabba-nav-logo" onClick={() => setMobileOpen(false)}>
            <img src={logo} alt="KABBA" className="kabba-nav-logo-img" />
          </Link>
          <button
            className="kabba-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="kabba-mobile-drawer-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`kabba-mobile-link ${isActive(link.to) ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <span>{link.label}</span>
              <span className="kabba-mobile-arrow">→</span>
            </Link>
          ))}
        </div>

        <div className="kabba-mobile-drawer-footer">
          <Link to="/cart" className="kabba-mobile-link" onClick={() => setMobileOpen(false)}>
            <span>🛒 Cart</span>
            <span className="kabba-mobile-arrow">→</span>
          </Link>
          <div className="kabba-mobile-theme-row">
            <button className="kabba-theme-toggle" onClick={toggle}>
              {theme === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Nav;
