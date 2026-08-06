import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Admin.css";

const NAV_ITEMS = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", icon: "📊", path: "/admin/dashboard" },
    ],
  },
  {
    section: "Catalog",
    items: [
      { label: "Products", icon: "👗", path: "/admin/dashboard", tab: "products" },
      { label: "Events", icon: "🎉", path: "/admin/dashboard", tab: "events" },
    ],
  },
  {
    section: "Sales",
    items: [
      { label: "Orders", icon: "📦", path: "/admin/orders" },
    ],
  },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin");
  };

  const isActive = (item) => {
    if (item.path !== location.pathname) return false;
    if (item.tab) {
      const params = new URLSearchParams(location.search);
      return params.get("tab") === item.tab;
    }
    return true;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">K</div>
          <div className="sidebar-brand">
            Kabba Designs
            <small>Admin Panel</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.section} className="sidebar-section">
              <div className="sidebar-section-title">{section.section}</div>
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  to={item.tab ? `${item.path}?tab=${item.tab}` : item.path}
                  className={`sidebar-link ${isActive(item) ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">A</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Admin</div>
              <div className="sidebar-user-role">Store Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 99,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="topbar-toggle"
              onClick={() => {
                if (window.innerWidth <= 1024) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
            >
              ☰
            </button>
          </div>
          <div className="topbar-right">
            <Link to="/products" className="topbar-btn" target="_blank">
              🌐 View Store
            </Link>
            <button className="topbar-btn danger" onClick={handleLogout}>
              ↩ Logout
            </button>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
