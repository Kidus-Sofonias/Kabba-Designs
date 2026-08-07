import { useCart } from "../../context/CartContext";

export function CartIcon() {
  const { cart } = useCart();
  const totalItems =
    cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <div className="kabba-cart-icon">
      {totalItems > 0 && (
        <span className="kabba-cart-badge">{totalItems}</span>
      )}
      {/* SVG cart icon with accent stroke */}
      <svg
        className="kabba-cart-svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    </div>
  );
}
