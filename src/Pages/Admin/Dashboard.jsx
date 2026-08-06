import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../Components/Admin/AdminLayout";
import "../../Components/Admin/Admin.css";

/* ── Helpers ── */
function parseImages(urls) {
  try {
    const arr = JSON.parse(urls || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function Toast({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            className="admin-btn ghost sm"
            onClick={() => onDismiss(t.id)}
            style={{ padding: "2px 6px", fontSize: 14 }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Stats ── */
function StatsCards({ onNavigate }) {
  const [stats, setStats] = useState({ products: 0, orders: 0, events: 0, totalRevenue: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, orderRes, eventRes] = await Promise.all([
          api.get("/products"),
          api.get("/orders").catch(() => ({ data: [] })),
          api.get("/events").catch(() => ({ data: [] })),
        ]);
        const orders = Array.isArray(orderRes.data) ? orderRes.data : [];
        const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        setStats({
          products: prodRes.data.length,
          orders: orders.length,
          events: eventRes.data.length,
          totalRevenue: revenue,
        });
      } catch (e) {
        console.error("Stats fetch error", e);
      }
    })();
  }, []);

  return (
    <div className="stats-grid">
      <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => onNavigate("products")}>
        <div className="stat-header">
          <div className="stat-icon gold">👗</div>
        </div>
        <div className="stat-value">{stats.products}</div>
        <div className="stat-label">Total Products</div>
      </div>
      <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => onNavigate("orders")}>
        <div className="stat-header">
          <div className="stat-icon terra">📦</div>
        </div>
        <div className="stat-value">{stats.orders}</div>
        <div className="stat-label">Total Orders</div>
      </div>
      <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => onNavigate("events")}>
        <div className="stat-header">
          <div className="stat-icon green">🎉</div>
        </div>
        <div className="stat-value">{stats.events}</div>
        <div className="stat-label">Active Events</div>
      </div>
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-icon blue">💰</div>
        </div>
        <div className="stat-value">
          {stats.totalRevenue.toLocaleString()} <span style={{ fontSize: 14, color: "var(--muted)" }}>Birr</span>
        </div>
        <div className="stat-label">Total Revenue</div>
      </div>
    </div>
  );
}

/* ── Product Manager ── */
function ProductManager({ addToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [form, setForm] = useState({
    name: "", price_birr: "", price_dollar: "", quantity: "", description: "", category: "Women",
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [keptImages, setKeptImages] = useState([]); // existing image URLs to keep on edit
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const CATEGORIES = ["All", "Women", "Men", "Children", "Jewelry", "Other"];

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", price_birr: "", price_dollar: "", quantity: "", description: "", category: "Women" });
    setImages([]);
    setPreviews([]);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || "",
      price_birr: product.price_birr || "",
      price_dollar: product.price_dollar || "",
      quantity: product.quantity || "",
      description: product.description || "",
      category: product.category || "Women",
    });
    const existing = parseImages(product.image_urls);
    setImages([]);
    setPreviews(existing);
    setKeptImages([...existing]); // track which existing URLs to keep
    setShowForm(true);
  };

  const handleFileChange = (files) => {
    const newImages = Array.from(files);
    setImages((prev) => [...prev, ...newImages]);
    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removePreview = (idx) => {
    setPreviews((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // If editing and this was an existing image (URL, not data:), remove from keptImages
      if (editing && prev[idx] && prev[idx].startsWith("http")) {
        setKeptImages((k) => k.filter((url) => url !== prev[idx]));
      }
      return next;
    });
    // Also remove from new images array if it was a newly added file
    if (idx < images.length) {
      setImages((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFileChange(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => fd.append(key, val));
    images.forEach((img) => fd.append("images", img));
    // When editing, send the existing image URLs to keep
    if (editing) {
      fd.append("existing_image_urls", JSON.stringify(keptImages));
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" };

      if (editing) {
        await api.put(`/products/${editing.id}`, fd, { headers });
        addToast("Product updated successfully", "success");
      } else {
        await api.post("/products", fd, { headers });
        addToast("Product created successfully", "success");
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to save product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      addToast("Product deleted", "success");
      fetchProducts();
    } catch {
      addToast("Failed to delete product", "error");
    }
  };

  return (
    <div>
      <div className="admin-card-header" style={{ padding: 0, borderBottom: "none", marginBottom: 20 }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="filter-chips">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`filter-chip ${categoryFilter === c ? "active" : ""}`}
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="admin-btn primary" onClick={openCreate}>
            + Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="admin-spinner" />
          <span style={{ color: "var(--muted)", fontSize: 14 }}>Loading products…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👗</div>
          <div className="empty-state-title">No products found</div>
          <div className="empty-state-text">
            {search || categoryFilter !== "All" ? "Try a different search or filter" : "Add your first product to get started"}
          </div>
          {!search && categoryFilter === "All" && (
            <button className="admin-btn primary" onClick={openCreate}>+ Add Product</button>
          )}
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((product) => {
            const imgs = parseImages(product.image_urls);
            return (
              <div key={product.id} className="product-card">
                {imgs[0] ? (
                  <img src={imgs[0]} alt={product.name} className="product-card-image" />
                ) : (
                  <div className="product-card-image" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "var(--muted)" }}>
                    📷
                  </div>
                )}
                <div className="product-card-body">
                  <div className="product-card-name">{product.name}</div>
                  <div className="product-card-meta">
                    <span className="product-card-price">
                      {Number(product.price_birr || 0).toLocaleString()} Birr
                    </span>
                    <span className="product-card-category">{product.category}</span>
                  </div>
                  <div className="product-card-actions">
                    <button className="admin-btn secondary sm" onClick={() => openEdit(product)}>
                      ✏️ Edit
                    </button>
                    <button className="admin-btn danger sm" onClick={() => handleDelete(product.id, product.name)}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editing ? "Edit Product" : "Add Product"}</h3>
              <button className="admin-modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Product Name <span className="required">*</span></label>
                  <input
                    className="admin-input"
                    placeholder="e.g. Habesha Kemis – Traditional Ethiopian Dress"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (Birr) <span className="required">*</span></label>
                    <input
                      className="admin-input"
                      type="number"
                      placeholder="4500"
                      value={form.price_birr}
                      onChange={(e) => setForm({ ...form, price_birr: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (USD)</label>
                    <input
                      className="admin-input"
                      type="number"
                      placeholder="78"
                      value={form.price_dollar}
                      onChange={(e) => setForm({ ...form, price_dollar: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity <span className="required">*</span></label>
                    <input
                      className="admin-input"
                      type="number"
                      placeholder="25"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="admin-input"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="admin-input"
                    rows={4}
                    placeholder="Describe the product, materials, sizing..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Images</label>
                  <div
                    className={`image-upload-zone ${dragOver ? "dragover" : ""}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className="image-upload-icon">📸</div>
                    <div className="image-upload-text">
                      <strong>Click to upload</strong> or drag and drop
                      <br />
                      PNG, JPG, WEBP up to 10MB each
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e.target.files)}
                  />
                  {previews.length > 0 && (
                    <div className="image-preview-grid">
                      {previews.map((src, idx) => (
                        <div key={idx} className="image-preview-item">
                          <img src={src} alt={`Preview ${idx + 1}`} />
                          <button
                            type="button"
                            className="image-preview-remove"
                            onClick={() => removePreview(idx)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="admin-btn primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="admin-spinner" style={{ borderTopColor: "var(--on-accent)" }} />
                    Saving…
                  </span>
                ) : (
                  editing ? "Update Product" : "Create Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Event Manager ── */
function EventManager({ addToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "", location_link: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const fetchEvents = async () => {
    try {
      const { data } = await api.get("/events");
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", start_date: "", end_date: "", location_link: "" });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (event) => {
    setEditing(event);
    setForm({
      name: event.name || "",
      start_date: event.date ? event.date.split("T")[0] : "",
      end_date: event.end_date ? event.end_date.split("T")[0] : "",
      location_link: event.location_link || "",
    });
    setImageFile(null);
    setImagePreview(event.image_url || null);
    setShowForm(true);
  };

  const handleFileChange = (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("start_date", form.start_date);
    fd.append("end_date", form.end_date);
    fd.append("location_link", form.location_link);
    if (imageFile) {
      fd.append("image", imageFile);
    } else if (editing && editing.image_url) {
      // Keep the existing image if no new file was selected
      fd.append("existing_image_url", editing.image_url);
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" };

      if (editing) {
        await api.put(`/events/${editing.id}`, fd, { headers });
        addToast("Event updated successfully", "success");
      } else {
        if (!imageFile) return addToast("Please select an event image", "error");
        await api.post("/events", fd, { headers });
        addToast("Event created successfully", "success");
      }
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to save event", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete event "${name}"?`)) return;
    try {
      await api.delete(`/events/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      addToast("Event deleted", "success");
      fetchEvents();
    } catch {
      addToast("Failed to delete event", "error");
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div>
      <div className="admin-card-header" style={{ padding: 0, borderBottom: "none", marginBottom: 20 }}>
        <div />
        <button className="admin-btn primary" onClick={openCreate}>+ Add Event</button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="admin-spinner" />
          <span style={{ color: "var(--muted)", fontSize: 14 }}>Loading events…</span>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎉</div>
          <div className="empty-state-title">No events yet</div>
          <div className="empty-state-text">Create your first event to promote it on the storefront</div>
          <button className="admin-btn primary" onClick={openCreate}>+ Add Event</button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {events.map((event) => (
            <div key={event.id} className="admin-card" style={{ display: "flex", overflow: "hidden" }}>
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.name}
                  style={{ width: 180, height: 140, objectFit: "cover", flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>{event.name}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>
                  📅 {formatDate(event.date)} — {formatDate(event.end_date)}
                </div>
                {event.location_link && (
                  <a href={event.location_link} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>
                    📍 View Location
                  </a>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 16, justifyContent: "center" }}>
                <button className="admin-btn secondary sm" onClick={() => openEdit(event)}>✏️ Edit</button>
                <button className="admin-btn danger sm" onClick={() => handleDelete(event.id, event.name)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editing ? "Edit Event" : "Add Event"}</h3>
              <button className="admin-modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Event Name <span className="required">*</span></label>
                  <input
                    className="admin-input"
                    placeholder="e.g. Addis Ababa Fashion Week 2026"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      className="admin-input"
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      className="admin-input"
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location Link</label>
                  <input
                    className="admin-input"
                    placeholder="https://maps.app.goo.gl/..."
                    value={form.location_link}
                    onChange={(e) => setForm({ ...form, location_link: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Image {!editing && <span className="required">*</span>}</label>
                  <div
                    className="image-upload-zone"
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="image-upload-icon">🖼️</div>
                    <div className="image-upload-text">
                      <strong>Click to upload</strong> event banner image
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                  {imagePreview && (
                    <div className="image-preview-grid" style={{ marginTop: 12 }}>
                      <div className="image-preview-item">
                        <img src={imagePreview} alt="Preview" />
                        <button
                          type="button"
                          className="image-preview-remove"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="admin-spinner" style={{ borderTopColor: "var(--on-accent)" }} />
                    Saving…
                  </span>
                ) : editing ? "Update Event" : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Order Table ── */
function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/orders");
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = !search || (o.name || "").toLowerCase().includes(search.toLowerCase()) || (o.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || (o.status || "Pending") === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      <div className="admin-card-header" style={{ padding: 0, borderBottom: "none", marginBottom: 20 }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-chips">
          {["All", "Pending", "Paid", "Shipped", "Delivered", "Cancelled"].map((s) => (
            <button
              key={s}
              className={`filter-chip ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="loading-state">
            <div className="admin-spinner" />
            <span style={{ color: "var(--muted)", fontSize: 14 }}>Loading orders…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No orders found</div>
            <div className="empty-state-text">
              {search || statusFilter !== "All" ? "Try a different search or filter" : "Orders will appear here when customers start shopping"}
            </div>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: "var(--muted)" }}>#{order.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{order.name || "—"}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{order.email}</div>
                    </td>
                    <td>
                      {(order.items || []).slice(0, 2).map((item, i) => (
                        <div key={i} style={{ fontSize: 13 }}>
                          {item.name} ×{item.quantity}
                        </div>
                      ))}
                      {(order.items || []).length > 2 && (
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          +{(order.items || []).length - 2} more
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--accent)" }}>
                      {Number(order.total || 0).toLocaleString()} Birr
                    </td>
                    <td>
                      <span className={`status-badge ${(order.status || "pending").toLowerCase()}`}>
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--muted)" }}>{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "products";
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const setTab = (tab) => setSearchParams({ tab });

  const TABS = [
    { key: "products", label: "Products", icon: "👗" },
    { key: "events", label: "Events", icon: "🎉" },
    { key: "orders", label: "Orders", icon: "📦" },
  ];

  return (
    <AdminLayout>
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <StatsCards onNavigate={setTab} />

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            style={{
              padding: "10px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === tab.key ? "var(--accent)" : "var(--muted)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: -1,
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "products" && <ProductManager addToast={addToast} />}
      {activeTab === "events" && <EventManager addToast={addToast} />}
      {activeTab === "orders" && <OrderManager addToast={addToast} />}
    </AdminLayout>
  );
}
