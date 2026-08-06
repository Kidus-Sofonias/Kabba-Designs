import { useCart } from "../../context/CartContext";
import api from "../../api/axios";
import { useState } from "react";
import { Link } from "react-router-dom";

const FIELDS = [
  { name: "name", label: "Full Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "address", label: "Address", type: "text" },
];

export default function Checkout() {
  const { cart, getTotal } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const total = getTotal();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "A valid email is required";
    if (!form.phone.trim()) next.phone = "Phone is required";
    if (!form.address.trim()) next.address = "Address is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChapa = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const { data } = await api.post("/chapa/create-payment", {
        ...form,
        items: cart,
        total,
      });
      window.location.href = data.checkout_url;
    } catch (err) {
      alert(err.response?.data?.error || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "60vh" }}>
        <h3>Your cart is empty</h3>
        <Link to="/products" className="btn btn-accent mt-3">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: "640px" }}>
      <Link to="/cart" className="muted text-decoration-none d-inline-block mb-3">
        ← Back to Cart
      </Link>
      <h2>Checkout</h2>

      <div className="mb-4">
        {FIELDS.map((field) => (
          <div key={field.name} className="mb-3">
            <label className="form-label">{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              className={`form-control ${errors[field.name] ? "is-invalid" : ""}`}
              placeholder={field.label}
              value={form[field.name]}
              onChange={handleChange}
            />
            {errors[field.name] && (
              <div className="invalid-feedback d-block">{errors[field.name]}</div>
            )}
          </div>
        ))}
      </div>

      <ul className="list-group mb-3">
        {cart.map((item) => (
          <li
            key={item.id}
            className="list-group-item d-flex justify-content-between"
          >
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>Birr {Number(item.price * item.quantity).toLocaleString()}</span>
          </li>
        ))}
        <li className="list-group-item fw-bold d-flex justify-content-between">
          <span>Total</span>
          <span>Birr {Number(total).toLocaleString()}</span>
        </li>
      </ul>

      <button
        onClick={handleChapa}
        disabled={loading}
        className="btn btn-accent w-100"
      >
        {loading ? "Processing…" : "Pay with Chapa"}
      </button>
      <p className="muted text-center small mt-3 mb-0">
        You'll be redirected to Chapa to complete your payment securely.
      </p>
    </div>
  );
}
