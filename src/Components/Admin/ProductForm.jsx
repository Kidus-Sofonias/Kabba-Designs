import React, { useState } from "react";
import axios from "../../api/axios";

function ProductForm() {
  const CATEGORIES = ["Women", "Men", "Children", "Jewelry", "Other"];

  const [form, setForm] = useState({
    name: "",
    price_birr: "",
    price_dollar: "",
    quantity: "",
    description: "",
    category: "",
    images: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "images") {
        for (let i = 0; i < value.length; i++) {
          fd.append("images", value[i]);
        }
      } else {
        fd.append(key, value);
      }
    });

    try {
      await axios.post("/products", fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Product uploaded");
    } catch {
      alert("Upload failed");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form onSubmit={handleSubmit}>
      <h4>Add Product</h4>
      <input
        name="name"
        className="form-control mb-2"
        placeholder="Name"
        onChange={handleChange}
      />
      <input
        name="price_birr"
        className="form-control mb-2"
        placeholder="Price (Birr)"
        onChange={handleChange}
      />
      <input
        name="price_dollar"
        className="form-control mb-2"
        placeholder="Price (Dollar)"
        onChange={handleChange}
      />
      <input
        name="quantity"
        type="number"
        className="form-control mb-2"
        placeholder="Available Quantity"
        onChange={handleChange}
      />
      <textarea
        name="description"
        className="form-control mb-2"
        rows={4}
        placeholder="Description"
        onChange={handleChange}
      ></textarea>
      <select
        name="category"
        className="form-control mb-2"
        value={form.category}
        onChange={handleChange}
      >
        <option value="">Select category…</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="file"
        multiple
        className="form-control mb-3"
        onChange={(e) => setForm({ ...form, images: e.target.files })}
      />
      <button type="submit" className="btn btn-warning">
        Upload
      </button>
    </form>
  );
}

export default ProductForm;
