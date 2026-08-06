import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import ProductCard from "./ProductCard";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get("category") || "All";

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get("/products")
      .then((res) => {
        if (!active) return;
        setProducts(Array.isArray(res.data) ? res.data : []);
        setError(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.category && set.add(p.category));
    return ["All", ...set];
  }, [products]);

  const filtered = useMemo(() => {
    if (selected === "All") return products;
    const needle = selected.toLowerCase();
    return products.filter(
      (p) => (p.category || "").toLowerCase() === needle
    );
  }, [products, selected]);

  const pickCategory = (cat) => {
    setSearchParams(cat === "All" ? {} : { category: cat }, { replace: true });
  };

  return (
    <div className="container mt-5 py-4" style={{ minHeight: "60vh" }}>
      <h2 className="mb-4 text-center" style={{ color: "var(--text)", fontWeight: 700 }}>Our Products</h2>

      {categories.length > 1 && (
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => pickCategory(cat)}
              className={`btn btn-sm ${
                selected === cat ? "btn-accent" : "btn-outline-light"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="muted mt-3">Loading products…</p>
        </div>
      ) : error ? (
        <div className="text-center py-5">
          <h4>Couldn't load products</h4>
          <p className="muted">
            Please check your connection and try again later.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <h4>No products found</h4>
          <p className="muted">
            Try a different category, or contact support for help.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((product) => (
            <div className="col-md-4" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
