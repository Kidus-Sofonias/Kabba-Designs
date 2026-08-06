import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Contact from "./Components/Contact/Contact";
import Women from "./Pages/Women/Women";
import Men from "./Pages/Men/Men";
import Jewelry from "./Pages/Jewlery/Jewlery";
import Children from "./Pages/Children/Children";
import Layout from "./Layout";
import Events from "./Pages/Events/Events";
import ProductList from "./Pages/Products/ProductList";
import ProductDetail from "./Pages/Products/ProductDetail";
import NotFound from "./Pages/NotFound";
import AdminLogin from "./Pages/Admin/Login";
import Dashboard from "./Pages/Admin/Dashboard";
import ProtectedRoute from "./Pages/Admin/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import Cart from "./Pages/Cart/Cart";
import Checkout from "./Pages/CheckOut/CheckOut";
import Orders from "./Pages/Admin/Orders";
import OrderDetail from "./Pages/Admin/OrderDetail";
import Success from "./Pages/Success/Success";

import AOS from "aos";
import "aos/dist/aos.css";

// Initialize once globally
AOS.init({ duration: 1000 });

function App() {
  return (
    <ThemeProvider>
      <Router>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/women" element={<Women />} />
              <Route path="/men" element={<Men />} />
              <Route path="/jewelry" element={<Jewelry />} />
              <Route path="/children" element={<Children />} />
              <Route path="/events" element={<Events />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<Success />} />
              <Route path="/success" element={<Success />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </CartProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
