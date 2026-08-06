import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { imageUrl } from "../../config";
import api from "../../api/axios";

function parseImages(product) {
  try {
    const images = JSON.parse(product.image_urls || "[]");
    return Array.isArray(images) ? images : [];
  } catch {
    return [];
  }
}

function ProductDetail() {
  const { id } = useParams();
  const { cart, addToCart, removeItem } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setProduct(null);
    setError(false);
    api
      .get(`/products/${id}`)
      .then(({ data }) => active && setProduct(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "60vh" }}>
        <h3>Product not found</h3>
        <Link to="/products" className="btn btn-accent mt-3">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  const images = parseImages(product);
  const image = images[0];
  const inCart = cart.some((item) => item.id === product.id);

  const handleAdd = () =>
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price_birr) || 0,
      image: image || null,
    });

  return (
    <div className="container py-5" style={{ minHeight: "80vh" }}>
      <Link to="/products" style={{ color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 14 }}>
        ← Back to Products
      </Link>
      <div className="row g-5">
        <div className="col-md-6">
          {image ? (
            <img
              src={imageUrl(image)}
              alt={product.name}
              style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 16, border: "1px solid var(--border)" }}
            />
          ) : (
            <div style={{ height: 400, background: "var(--panel)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "var(--muted)" }}>
              📷
            </div>
          )}
        </div>
        <div className="col-md-6" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>{product.name}</h2>
          <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>{product.description}</p>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", marginBottom: 24 }}>
            Birr {Number(product.price_birr || 0).toLocaleString()}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
            {Number(product.quantity || 0) === 0 ? (
              <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>Out of Stock</span>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>In Stock</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {inCart ? (
              <button
                style={{ padding: "12px 28px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
                onClick={() => removeItem(product.id)}
              >
                Remove from Cart
              </button>
            ) : (
              <button
                style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", color: "var(--on-accent)", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
                onClick={handleAdd}
                disabled={Number(product.quantity || 0) === 0}
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
