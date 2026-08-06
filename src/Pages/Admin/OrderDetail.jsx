import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch((err) => console.error("Failed to fetch order", err));
  }, [id]);

  if (!order) return <div className="container mt-5">Loading…</div>;

  const items = order.items || [];

  return (
    <div className="container mt-5">
      <Link to="/admin/orders" className="muted text-decoration-none d-inline-block mb-3">
        ← Back to Orders
      </Link>
      <h2>Order Detail</h2>
      <p>
        <b>Order ID:</b> {order.id}
      </p>
      <p>
        <b>Created:</b> {new Date(order.created_at).toLocaleString()}
      </p>
      <p>
        <b>Customer:</b> {order.email}
      </p>
      <p>
        <b>Phone:</b> {order.phone}
      </p>
      <p>
        <b>Location:</b> {order.location || order.address || "—"}
      </p>
      <p>
        <b>Payment:</b> {order.payment || "—"}
      </p>
      <p>
        <b>Paid:</b> {order.paid ? "Yes" : "No"}
      </p>
      <h4>Products:</h4>
      <ul>
        {items.length === 0 ? (
          <li>No items recorded.</li>
        ) : (
          items.map((item, idx) => (
            <li key={idx}>
              {item.name} — Birr {Number(item.price || 0).toLocaleString()} × {item.quantity}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
