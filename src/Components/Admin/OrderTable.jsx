import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { CSVLink } from "react-csv";

function OrderTable() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to fetch orders", err);
        setOrders([]);
      });
  }, []);

  const csvData = orders.map((order) => ({
    Name: order.name,
    Email: order.email,
    Phone: order.phone,
    Address: order.address,
    Items: order.items
      ? order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")
      : "",
    Total: order.total,
    Status: order.status || "Pending",
  }));

  return (
    <div>
      <h4>All Orders</h4>
      <div className="mb-3">
        <CSVLink
          data={csvData}
          filename="orders.csv"
          className="btn btn-primary"
        >
          Download CSV
        </CSVLink>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Items</th>
              <th>Total</th>
              <th>Address</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.name}</td>
                <td>
                  <ul className="list-unstyled mb-0">
                    {(order.items || []).map((item) => (
                      <li key={item.product_id}>
                        {item.name} (x{item.quantity}) — Birr{" "}
                        {Number(item.price || 0).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>Birr {Number(order.total || 0).toLocaleString()}</td>
                <td>{order.address}</td>
                <td>{order.email}</td>
                <td>{order.phone}</td>
                <td>{order.status || "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderTable;
