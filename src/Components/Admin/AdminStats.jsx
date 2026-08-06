import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

function AdminStats() {
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          axios.get("/orders"),
          axios.get("/products"),
        ]);
        setStats({
          totalOrders: ordersRes.data.length,
          totalProducts: productsRes.data.length,
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="row text-center">
      <div className="col-md-6 mb-4">
        <div
          className="p-4 rounded shadow-sm"
          style={{ background: "var(--panel)", color: "var(--text)" }}
        >
          <h3>{stats.totalOrders}</h3>
          <p>Total Orders</p>
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div
          className="p-4 rounded shadow-sm"
          style={{ background: "var(--panel)", color: "var(--text)" }}
        >
          <h3>{stats.totalProducts}</h3>
          <p>Total Products</p>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;
