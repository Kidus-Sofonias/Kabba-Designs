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
    <div className="container py-5">
      <Link to="/products" className="muted text-decoration-none d-inline-block mb-3">
        ← Back to Products
      </Link>
      <div className="row">
        <div className="col-md-6">
          {image ? (
            <img
              src={imageUrl(image)}
              className="img-fluid rounded"
              alt={product.name}
            />
          ) : (
            <div style={{ height: 300, background: "var(--panel)" }} />
          )}
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="muted">{product.description}</p>
          <p>
            <strong className="fs-4">
              Birr {Number(product.price_birr || 0).toLocaleString()}
            </strong>
          </p>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            {inCart ? (
              <button
                className="btn btn-outline-light"
                onClick={() => removeItem(product.id)}
              >
                Remove from Cart
              </button>
            ) : (
              <button
                className="btn btn-accent"
                onClick={handleAdd}
                disabled={Number(product.quantity || 0) === 0}
              >
                Add to Cart
              </button>
            )}
            {Number(product.quantity || 0) === 0 ? (
              <span className="badge bg-danger">Out of Stock</span>
            ) : (
              <span className="badge bg-success">In Stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
