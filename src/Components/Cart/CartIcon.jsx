import { useCart } from "../../context/CartContext";

export function CartIcon() {
  const { cart } = useCart();
  const totalItems =
    cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width: 40,
        height: 40,
      }}
    >
      {totalItems > 0 && (
        <span
          style={{
            position: "absolute",
            top: -8,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--accent)",
            color: "var(--on-accent)",
            borderRadius: "50%",
            padding: "0 6px",
            fontSize: 16,
            fontWeight: "bold",
            zIndex: 2,
            lineHeight: 1.6,
          }}
        >
          {totalItems}
        </span>
      )}
      {/* SVG cart icon with accent stroke */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: "block", margin: "0 auto" }}
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    </div>
  );
}
