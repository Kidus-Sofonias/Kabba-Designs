import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { imageUrl } from "../../config";
import "./ProductCard.css";

function parseImages(urls) {
  try {
    const images = JSON.parse(urls || "[]");
    return Array.isArray(images) ? images : [];
  } catch {
    return [];
  }
}

function ProductCard({ product }) {
  const { cart, addToCart, removeItem } = useCart();
  const inCart = cart.some((item) => item.id === product.id);
  const image = parseImages(product.image_urls)[0];
  const outOfStock = Number(product.quantity || 0) === 0;

  const handleAdd = () =>
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price_birr) || 0,
      image: image || null,
    });

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-image">
        {image ? (
          <img
            src={imageUrl(image)}
            alt={product.name}
          />
        ) : (
          <div style={{ height: 320, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "var(--muted)" }}>
            📷
          </div>
        )}
      </Link>
      <div className="product-info">
        <Link to={`/products/${product.id}`} style={{ textDecoration: "none", color: "var(--text)" }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.name}</div>
        </Link>
        <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 16 }}>
          Birr {Number(product.price_birr || 0).toLocaleString()}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {outOfStock ? (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>Out of Stock</span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>In Stock</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {inCart ? (
            <button
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              onClick={() => removeItem(product.id)}
            >
              Remove
            </button>
          ) : (
            <button
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", color: "var(--on-accent)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              onClick={handleAdd}
              disabled={outOfStock}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
