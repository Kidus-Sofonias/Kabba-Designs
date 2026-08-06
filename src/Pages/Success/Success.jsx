import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import api from "../../api/axios";
import "./Success.css";

export default function Success() {
  const { clearCart } = useCart();
  const location = useLocation();
  const [status, setStatus] = useState("checking"); // checking | success | failed | unavailable
  const [txRef, setTxRef] = useState("");

  useEffect(() => {
    const ref = new URLSearchParams(location.search).get("tx_ref");
    setTxRef(ref || "");

    if (!ref) {
      setStatus("failed");
      return;
    }

    api
      .post("/chapa/verify-and-create", { tx_ref: ref })
      .then(({ data }) => {
        if (data.status === "success") {
          clearCart();
          setStatus("success");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("unavailable"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const copyTxRef = () => {
    if (txRef) {
      navigator.clipboard.writeText(txRef).then(() => {
        alert("Transaction reference copied!");
      });
    }
  };

  return (
    <div className="success-page">
      <div className="success-container">
        {status === "checking" && (
          <div className="success-card animate-scale-in">
            <div className="success-icon-wrapper checking">
              <div className="success-spinner" />
            </div>
            <h2>Verifying Payment</h2>
            <p className="success-subtitle">Please wait while we confirm your payment with Chapa...</p>
          </div>
        )}

        {status === "success" && (
          <div className="success-card animate-scale-in">
            <div className="success-icon-wrapper success">
              <span className="success-check">✓</span>
            </div>
            <h2>Payment Successful!</h2>
            <p className="success-subtitle">
              Your order has been placed. Thank you for shopping with Kabba!
            </p>

            {/* TX Reference Card */}
            {txRef && (
              <div className="tx-ref-card">
                <div className="tx-ref-label">Your Transaction Reference</div>
                <div className="tx-ref-value" onClick={copyTxRef} title="Click to copy">
                  <span className="tx-ref-text">{txRef}</span>
                  <span className="tx-ref-copy">📋</span>
                </div>
                <div className="tx-ref-hint">
                  Save this reference to track your order
                </div>
              </div>
            )}

            {/* Tracking Info */}
            <div className="tracking-info">
              <div className="tracking-info-icon">📦</div>
              <div className="tracking-info-text">
                <strong>How to track your order:</strong>
                <ol>
                  <li>Go to <Link to="/track-order" className="success-link">Track Order</Link> from the menu</li>
                  <li>Paste your transaction reference above</li>
                  <li>See your order status in real-time — from Processing to Delivered</li>
                </ol>
              </div>
            </div>

            <div className="success-actions">
              <Link className="btn btn-accent" to={`/track-order`}>
                📦 Track My Order
              </Link>
              <Link className="btn btn-outline-light" to="/products">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {status === "unavailable" && (
          <div className="success-card animate-scale-in">
            <div className="success-icon-wrapper warning">
              <span>⏳</span>
            </div>
            <h2>Payment Pending Verification</h2>
            <p className="success-subtitle">
              We're having trouble verifying your payment right now. If you were
              charged, your order will be confirmed shortly. You can check back
              later using your transaction reference.
            </p>

            {txRef && (
              <div className="tx-ref-card">
                <div className="tx-ref-label">Your Transaction Reference</div>
                <div className="tx-ref-value" onClick={copyTxRef} title="Click to copy">
                  <span className="tx-ref-text">{txRef}</span>
                  <span className="tx-ref-copy">📋</span>
                </div>
              </div>
            )}

            <div className="success-actions">
              <Link className="btn btn-accent" to="/track-order">
                📦 Track My Order
              </Link>
              <Link className="btn btn-outline-light" to="/contact">
                Contact Us
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="success-card animate-scale-in">
            <div className="success-icon-wrapper error">
              <span>✕</span>
            </div>
            <h2>Payment Not Found</h2>
            <p className="success-subtitle">
              We couldn't find a completed payment for this order. If you believe
              this is a mistake, please contact us.
            </p>
            <div className="success-actions">
              <Link className="btn btn-accent" to="/cart">
                Back to Cart
              </Link>
              <Link className="btn btn-outline-light" to="/contact">
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
