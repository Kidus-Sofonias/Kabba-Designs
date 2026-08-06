import { useCart } from "../../context/CartContext";
import { useState } from "react";

function parseImages(urls) {
  try {
    const images = JSON.parse(urls || "[]");
    return Array.isArray(images) ? images : [];
  } catch {
    return [];
  }
}

export function OrderForm({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (product && product.id && product.price_birr) {
      const item = {
        id: product.id,
        name: product.name,
        price: Number(product.price_birr),
        quantity: 1,
        image: parseImages(product.image_urls)[0] || null,
      };
      addToCart(item);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } else {
      alert("Invalid product info");
    }
  };

  return (
    <div style={{ display: "inline" }}>
      <button className="btn btn-outline-warning" onClick={handleAdd}>
        Add to Cart
      </button>
      {added && (
        <span style={{ color: "green", marginLeft: 8 }}>Added to cart!</span>
      )}
    </div>
  );
}
