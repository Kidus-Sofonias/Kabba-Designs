import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../Components/Admin/AdminLayout";
import "../../Components/Admin/Admin.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = !search || (o.name || "").toLowerCase().includes(search.toLowerCase()) || (o.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || (o.status || "Pending") === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-chips">
          {["All", "Pending", "Paid", "Shipped", "Delivered", "Cancelled"].map((s) => (
            <button
              key={s}
              className={`filter-chip ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="loading-state">
            <div className="admin-spinner" />
            <span style={{ color: "var(--muted)", fontSize: 14 }}>Loading orders…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No orders found</div>
            <div className="empty-state-text">
              {search || statusFilter !== "All" ? "Try a different search or filter" : "Orders will appear here when customers place them"}
            </div>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: "var(--muted)" }}>#{order.id}</td>
                    <td style={{ fontWeight: 500 }}>{order.name || "—"}</td>
                    <td style={{ fontSize: 13, color: "var(--muted)" }}>{order.email}</td>
                    <td style={{ fontSize: 13 }}>{order.phone || "—"}</td>
                    <td>
                      {(order.items || []).map((item, i) => (
                        <div key={i} style={{ fontSize: 13 }}>
                          {item.name} ×{item.quantity}
                        </div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--accent)" }}>
                      {Number(order.total || 0).toLocaleString()} Birr
                    </td>
                    <td>
                      <span className={`status-badge ${(order.status || "pending").toLowerCase()}`}>
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--muted)" }}>{formatDate(order.created_at)}</td>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} className="admin-btn secondary sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
