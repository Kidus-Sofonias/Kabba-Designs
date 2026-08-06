import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import api from "../../api/axios";

export default function Success() {
  const { clearCart } = useCart();
  const location = useLocation();
  const [status, setStatus] = useState("checking"); // checking | success | failed | unavailable

  useEffect(() => {
    const txRef = new URLSearchParams(location.search).get("tx_ref");

    if (!txRef) {
      setStatus("failed");
      return;
    }

    // Confirm the payment server-side (never trust the client alone).
    api
      .post("/chapa/verify", { tx_ref: txRef })
      .then(({ data }) => {
        if (data.status === "success") {
          clearCart();
          setStatus("success");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("unavailable"));
    // clearCart is intentionally omitted from deps — including it would re-run
    // this effect (and the verify call) on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <div className="container py-5 text-center" style={{ minHeight: "60vh" }}>
      {status === "checking" && (
        <>
          <h2>Checking payment…</h2>
          <p className="muted">Please wait while we confirm your payment.</p>
        </>
      )}

      {status === "success" && (
        <>
          <h2>✅ Payment Successful</h2>
          <p>Your order has been placed. Thank you for shopping with Kabba!</p>
          <Link className="btn btn-accent mt-4" to="/products">
            Continue Shopping
          </Link>
        </>
      )}

      {status === "unavailable" && (
        <>
          <h2>⏳ We couldn't confirm your payment</h2>
          <p className="muted">
            We're having trouble verifying your payment right now. If you were
            charged, please contact us and we'll confirm your order right away.
          </p>
          <Link className="btn btn-accent mt-4" to="/contact">
            Contact Us
          </Link>
        </>
      )}

      {status === "failed" && (
        <>
          <h2>Payment not found</h2>
          <p className="muted">
            We couldn't find a completed payment for this order. If you believe
            this is a mistake, please contact us.
          </p>
          <Link className="btn btn-accent mt-4" to="/cart">
            Back to Cart
          </Link>
        </>
      )}
    </div>
  );
}
