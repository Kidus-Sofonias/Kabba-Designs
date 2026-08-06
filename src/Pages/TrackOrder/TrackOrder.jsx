import { useState } from "react";
import api from "../../api/axios";
import "./TrackOrder.css";

const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

export default function TrackOrder() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setOrders(null);

    try {
      const isEmail = query.includes("@");
      const params = isEmail ? { email: query.trim() } : { tx_ref: query.trim() };
      const { data } = await api.get("/orders/track", { params });
      setOrders(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err.response?.data?.error || "No orders found. Please check your reference or email.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const statusColor = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "delivered") return "#10b981";
    if (s === "shipped") return "#3b82f6";
    if (s === "processing") return "#f59e0b";
    if (s === "cancelled") return "#ef4444";
    return "#6b7280";
  };

  const getStepIndex = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "cancelled") return -1;
    const idx = STATUS_STEPS.findIndex((step) => step.toLowerCase() === s);
    return idx >= 0 ? idx : 0;
  };

  const parseImages = (urls) => {
    try {
      const arr = JSON.parse(urls || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="track-order-page">
      <div className="track-order-container">
        {/* Header */}
        <div className="track-order-header">
          <div className="track-order-icon">📦</div>
          <h1>Track Your Order</h1>
          <p>Enter your transaction reference or email to check your order status</p>
        </div>

        {/* Search form */}
        <form className="track-order-form" onSubmit={handleSearch}>
          <div className="track-order-input-group">
            <input
              type="text"
              className="track-order-input"
              placeholder="Enter TX reference (e.g. dc114596-...) or your email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="track-order-btn" disabled={loading}>
              {loading ? (
                <span className="track-order-spinner" />
              ) : (
                <>🔍 Track</>
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="track-order-error">
            <span>✕</span> {error}
          </div>
        )}

        {/* Results */}
        {orders && orders.length === 0 && !error && (
          <div className="track-order-empty">
            <div className="track-order-empty-icon">🔍</div>
            <div>No orders found for this reference</div>
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="track-order-results">
            {orders.map((order) => {
              const stepIdx = getStepIndex(order.status);
              const isCancelled = (order.status || "").toLowerCase() === "cancelled";
              return (
                <div key={order.id} className="track-order-card">
                  {/* Order summary */}
                  <div className="track-order-card-header">
                    <div>
                      <div className="track-order-id">Order #{order.id}</div>
                      <div className="track-order-date">{formatDate(order.created_at)}</div>
                    </div>
                    <div className="track-order-total">
                      {Number(order.total || 0).toLocaleString()} Birr
                    </div>
                  </div>

                  {/* Status progress bar */}
                  {!isCancelled ? (
                    <div className="track-progress">
                      <div className="track-progress-bar">
                        <div
                          className="track-progress-fill"
                          style={{
                            width: `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                            background: statusColor(order.status),
                          }}
                        />
                      </div>
                      <div className="track-progress-steps">
                        {STATUS_STEPS.map((step, i) => (
                          <div
                            key={step}
                            className={`track-step ${i <= stepIdx ? "active" : ""}`}
                          >
                            <div
                              className="track-step-dot"
                              style={{
                                background: i <= stepIdx ? statusColor(order.status) : "var(--border)",
                                boxShadow: i <= stepIdx ? `0 0 0 3px ${statusColor(order.status)}22` : "none",
                              }}
                            >
                              {i < stepIdx ? "✓" : i === stepIdx ? "●" : ""}
                            </div>
                            <div className="track-step-label">{step}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="track-cancelled-badge">
                      <span>✕</span> Order Cancelled
                    </div>
                  )}

                  {/* Order items */}
                  {order.items && order.items.length > 0 && (
                    <div className="track-order-items">
                      {order.items.map((item, i) => {
                        const imgs = parseImages(item.image_urls);
                        return (
                          <div key={i} className="track-order-item">
                            {imgs[0] ? (
                              <img src={imgs[0]} alt={item.name} className="track-item-img" />
                            ) : (
                              <div className="track-item-img track-item-placeholder">📷</div>
                            )}
                            <div className="track-item-info">
                              <div className="track-item-name">{item.name}</div>
                              <div className="track-item-meta">
                                Qty: {item.quantity} × {Number(item.price || 0).toLocaleString()} Birr
                              </div>
                            </div>
                            <div className="track-item-subtotal">
                              {Number((item.price || 0) * (item.quantity || 1)).toLocaleString()} Birr
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TX Ref */}
                  <div className="track-order-footer">
                    <span className="track-tx-ref">TX: {order.tx_ref}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
