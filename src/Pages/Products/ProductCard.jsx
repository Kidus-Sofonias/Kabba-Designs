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
    <div className="card shadow-sm h-100">
      {image ? (
        <img
          src={imageUrl(image)}
          className="card-img-top"
          alt={product.name}
          style={{ height: 220, objectFit: "cover" }}
        />
      ) : (
        <div style={{ height: 200, background: "var(--panel)" }} />
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text product-price">
          Birr {Number(product.price_birr || 0).toLocaleString()}
        </p>
        <div className="d-flex gap-2 align-items-center flex-wrap mt-auto">
          {inCart ? (
            <button
              className="btn btn-outline-light"
              onClick={() => removeItem(product.id)}
            >
              Remove
            </button>
          ) : (
            <button
              className="btn btn-accent"
              onClick={handleAdd}
              disabled={outOfStock}
            >
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          )}
          {outOfStock ? (
            <span className="badge bg-danger">Out of Stock</span>
          ) : (
            <span className="badge bg-success">In Stock</span>
          )}
          <Link to={`/products/${product.id}`} className="btn btn-outline-light">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
