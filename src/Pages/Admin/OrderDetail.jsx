import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../Components/Admin/AdminLayout";
import "../../Components/Admin/Admin.css";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch((err) => console.error("Failed to fetch order", err))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AdminLayout>
      <Link
        to="/admin/orders"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--muted)",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 24,
          transition: "color 0.2s ease",
        }}
      >
        ← Back to Orders
      </Link>

      {loading ? (
        <div className="loading-state">
          <div className="admin-spinner" />
          <span style={{ color: "var(--muted)", fontSize: 14 }}>Loading order…</span>
        </div>
      ) : !order ? (
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <div className="empty-state-title">Order not found</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 24, maxWidth: 800 }}>
          {/* Order header */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Order</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>#{order.id}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`status-badge ${(order.status || "pending").toLowerCase()}`} style={{ fontSize: 13, padding: "6px 14px" }}>
                  {order.status || "Pending"}
                </span>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>{formatDate(order.created_at)}</div>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Customer Information</span>
            </div>
            <div className="admin-card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--muted)", marginBottom: 4 }}>Name</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{order.name || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--muted)", marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{order.email || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--muted)", marginBottom: 4 }}>Phone</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{order.phone || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--muted)", marginBottom: 4 }}>Location</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{order.address || order.location || "—"}</div>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Payment</span>
            </div>
            <div className="admin-card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--muted)", marginBottom: 4 }}>Method</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{order.payment || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--muted)", marginBottom: 4 }}>Paid</div>
                <span className={`status-badge ${order.paid ? "paid" : "pending"}`}>
                  {order.paid ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--muted)", marginBottom: 4 }}>Total</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>
                  {Number(order.total || 0).toLocaleString()} Birr
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Items</span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                {(order.items || []).length} product{(order.items || []).length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="admin-card-body" style={{ padding: 0 }}>
              {(order.items || []).length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>No items recorded</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: "center" }}>Qty</th>
                      <th style={{ textAlign: "right" }}>Unit Price</th>
                      <th style={{ textAlign: "right" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td style={{ textAlign: "center" }}>×{item.quantity}</td>
                        <td style={{ textAlign: "right" }}>{Number(item.price || 0).toLocaleString()} Birr</td>
                        <td style={{ textAlign: "right", fontWeight: 600, color: "var(--accent)" }}>
                          {Number((item.price || 0) * (item.quantity || 1)).toLocaleString()} Birr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
