import React, { useState } from "react";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import ProductForm from "../../Components/Admin/ProductForm";
import EventForm from "../../Components/Admin/EventForm";
import OrderTable from "../../Components/Admin/OrderTable";
import AdminStats from "../../Components/Admin/AdminStats";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <>
      <AdminNavbar />
      <div className="container py-4">
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "products" && "active"}`}
              onClick={() => setActiveTab("products")}
            >
              Products
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "events" && "active"}`}
              onClick={() => setActiveTab("events")}
            >
              Events
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "orders" && "active"}`}
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "stats" && "active"}`}
              onClick={() => setActiveTab("stats")}
            >
              Stats
            </button>
          </li>
        </ul>

        {activeTab === "products" && <ProductForm />}
        {activeTab === "events" && <EventForm />}
        {activeTab === "orders" && <OrderTable />}
        {activeTab === "stats" && <AdminStats />}
      </div>
    </>
  );
}

export default Dashboard;
