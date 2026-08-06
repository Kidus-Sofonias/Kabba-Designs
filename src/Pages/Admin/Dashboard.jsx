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
        const token = localStorage.getItem("token");
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
        const [prodRes, orderRes, eventRes] = await Promise.all([
          api.get("/products"),
          api.get("/orders", authHeaders).catch(() => ({ data: [] })),
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

/* ── Order Manager ── */
const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function OrderManager({ addToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  // Delivery confirmation modal state
  const [deliverModal, setDeliverModal] = useState(null); // orderId or null
  const [deliverFile, setDeliverFile] = useState(null);
  const [deliverPreview, setDeliverPreview] = useState(null);
  const [deliverSubmitting, setDeliverSubmitting] = useState(false);
  const deliverFileRef = useRef();

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = !search || (o.name || "").toLowerCase().includes(search.toLowerCase()) || (o.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || (o.status || "Pending") === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    // If marking as Delivered, open the delivery proof modal
    if (newStatus === "Delivered") {
      setDeliverModal(orderId);
      setDeliverFile(null);
      setDeliverPreview(null);
      return;
    }
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      addToast(`Order #${orderId} marked as ${newStatus}`, "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeliverConfirm = async () => {
    if (!deliverFile) return addToast("Please upload a delivery proof image", "error");
    setDeliverSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("status", "Delivered");
      fd.append("delivery_proof", deliverFile);
      await api.put(`/orders/${deliverModal}/status`, fd, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "multipart/form-data" },
      });
      setOrders((prev) => prev.map((o) => o.id === deliverModal ? { ...o, status: "Delivered" } : o));
      addToast(`Order #${deliverModal} marked as Delivered with proof`, "success");
      setDeliverModal(null);
      setDeliverFile(null);
      setDeliverPreview(null);
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to mark as delivered", "error");
    } finally {
      setDeliverSubmitting(false);
    }
  };

  const handleDeliverFileChange = (file) => {
    if (!file) return;
    setDeliverFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setDeliverPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const statusColor = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "delivered") return { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" };
    if (s === "shipped") return { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" };
    if (s === "processing") return { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" };
    if (s === "cancelled") return { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" };
    return { bg: "rgba(107, 114, 128, 0.15)", color: "#6b7280" };
  };

  return (
    <div>
      <div className="admin-card-header" style={{ padding: 0, borderBottom: "none", marginBottom: 20 }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-chips">
          {["All", ...STATUS_OPTIONS].map((s) => (
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
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map((order) => {
              const sc = statusColor(order.status);
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} className="admin-card" style={{ overflow: "hidden" }}>
                  {/* Order header row */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", cursor: "pointer" }}
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div style={{ fontWeight: 700, color: "var(--muted)", fontSize: 14, minWidth: 40 }}>#{order.id}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>{order.name || "—"}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{order.email}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>
                      {Number(order.total || 0).toLocaleString()} Birr
                    </div>
                    <div
                      style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: sc.bg,
                        color: sc.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.status || "Pending"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {formatDate(order.created_at)}
                    </div>
                    <div style={{ fontSize: 18, color: "var(--muted)", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>
                      ▾
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                        {/* Customer info */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Customer Details</div>
                          <div style={{ fontSize: 14, color: "var(--text)", marginBottom: 4 }}><strong>Name:</strong> {order.name || "—"}</div>
                          <div style={{ fontSize: 14, color: "var(--text)", marginBottom: 4 }}><strong>Email:</strong> {order.email || "—"}</div>
                          <div style={{ fontSize: 14, color: "var(--text)", marginBottom: 4 }}><strong>Phone:</strong> {order.phone || "—"}</div>
                          <div style={{ fontSize: 14, color: "var(--text)" }}><strong>Address:</strong> {order.address || "—"}</div>
                        </div>

                        {/* Status update */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Update Status</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {STATUS_OPTIONS.map((s) => (
                              <button
                                key={s}
                                disabled={updatingId === order.id || (order.status || "Pending") === s}
                                onClick={() => handleStatusChange(order.id, s)}
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: 8,
                                  border: (order.status || "Pending") === s ? `2px solid ${statusColor(s).color}` : "1px solid var(--border)",
                                  background: (order.status || "Pending") === s ? statusColor(s).bg : "var(--panel)",
                                  color: (order.status || "Pending") === s ? statusColor(s).color : "var(--muted)",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: (order.status || "Pending") === s ? "default" : "pointer",
                                  opacity: updatingId === order.id ? 0.5 : 1,
                                  transition: "all 0.2s",
                                }}
                              >
                                {s === "Delivered" && "✓ "}{s === "Shipped" && "🚚 "}{s === "Cancelled" && "✕ "}{s}
                              </button>
                            ))}
                          </div>
                          {updatingId === order.id && (
                            <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                              <span className="admin-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Updating…
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Order Items</div>
                      <div style={{ display: "grid", gap: 8 }}>
                        {(order.items || []).map((item, i) => {
                          const imgs = parseImages(item.image_urls);
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--bg)", borderRadius: 10 }}>
                              {imgs[0] ? (
                                <img src={imgs[0]} alt={item.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--muted)" }}>📷</div>
                              )}
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{item.name}</div>
                                <div style={{ fontSize: 12, color: "var(--muted)" }}>Qty: {item.quantity} × {Number(item.price || 0).toLocaleString()} Birr</div>
                              </div>
                              <div style={{ fontWeight: 600, color: "var(--accent)", fontSize: 14 }}>
                                {Number((item.price || 0) * (item.quantity || 1)).toLocaleString()} Birr
                              </div>
                            </div>
                          );
                        })}
                        {(order.items || []).length === 0 && (
                          <div style={{ fontSize: 13, color: "var(--muted)", padding: 10 }}>No item details available</div>
                        )}
                      </div>

                      {/* Payment info */}
                      <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--bg)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>TX Ref: <code style={{ fontSize: 11 }}>{order.tx_ref}</code></div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>Total: {Number(order.total || 0).toLocaleString()} Birr</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delivery Confirmation Modal */}
      {deliverModal && (
        <div className="admin-modal-overlay" onClick={() => !deliverSubmitting && setDeliverModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">📦 Confirm Delivery — Order #{deliverModal}</h3>
              <button className="admin-modal-close" onClick={() => !deliverSubmitting && setDeliverModal(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
                Upload a photo of the delivered package as proof of delivery. This image will be visible to the customer.
              </p>

              {/* Image upload zone */}
              <div
                className="image-upload-zone"
                onClick={() => !deliverSubmitting && deliverFileRef.current?.click()}
                style={{ marginBottom: 16 }}
              >
                <div className="image-upload-icon">📸</div>
                <div className="image-upload-text">
                  <strong>Click to upload</strong> delivery proof photo
                  <br />
                  PNG, JPG, WEBP up to 10MB
                </div>
              </div>
              <input
                ref={deliverFileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleDeliverFileChange(e.target.files[0])}
              />

              {/* Preview */}
              {deliverPreview && (
                <div className="image-preview-grid" style={{ marginBottom: 0 }}>
                  <div className="image-preview-item">
                    <img src={deliverPreview} alt="Delivery proof" />
                    <button
                      type="button"
                      className="image-preview-remove"
                      onClick={() => { setDeliverFile(null); setDeliverPreview(null); }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn secondary" onClick={() => setDeliverModal(null)} disabled={deliverSubmitting}>
                Cancel
              </button>
              <button
                className="admin-btn primary"
                onClick={handleDeliverConfirm}
                disabled={deliverSubmitting || !deliverFile}
                style={{ background: deliverFile ? "#10b981" : undefined }}
              >
                {deliverSubmitting ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="admin-spinner" style={{ borderTopColor: "var(--on-accent)" }} />
                    Uploading…
                  </span>
                ) : (
                  <>✓ Confirm Delivery</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
