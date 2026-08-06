import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch orders", err));
  }, []);

  return (
    <div className="container mt-5">
      <h2>Orders</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Created</th>
            <th>Customer</th>
            <th>Paid</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{new Date(order.created_at).toLocaleString()}</td>
              <td>{order.email}</td>
              <td>{order.paid ? "Yes" : "No"}</td>
              <td>{order.payment || "—"}</td>
              <td>
                <Link to={`/admin/orders/${order.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
