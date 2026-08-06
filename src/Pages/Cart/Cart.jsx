import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import { imageUrl } from "../../config";

const formatBirr = (n) => `Birr ${Number(n || 0).toLocaleString()}`;

export default function Cart() {
  const { cart, increment, decrement, removeItem, clearCart, getTotal } =
    useCart();

  return (
    <div className="container py-5" style={{ minHeight: "60vh" }}>
      <h2 className="mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <div className="text-center py-5">
          <p className="muted mb-4">Your cart is empty.</p>
          <Link to="/products" className="btn btn-accent">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-dark align-middle">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td style={{ width: "100px" }}>
                      {item.image ? (
                        <img
                          src={imageUrl(item.image)}
                          alt={item.name}
                          className="img-thumbnail"
                          style={{ maxWidth: "80px" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "80px",
                            height: "60px",
                            backgroundColor: "var(--panel-2)",
                            borderRadius: 6,
                          }}
                        />
                      )}
                    </td>
                    <td>{item.name}</td>
                    <td>
                      <div className="d-inline-flex align-items-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-light"
                          onClick={() => decrement(item.id)}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span className="fw-bold">{item.quantity || 1}</span>
                        <button
                          className="btn btn-sm btn-outline-light"
                          onClick={() => increment(item.id)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{formatBirr(item.price)}</td>
                    <td>{formatBirr(item.price * (item.quantity || 1))}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
            <div>
              <button
                className="btn btn-outline-light me-2"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <Link to="/products" className="btn btn-outline-light">
                Continue Shopping
              </Link>
            </div>
            <div className="text-end">
              <h4>Total: {formatBirr(getTotal())}</h4>
              <Link to="/checkout" className="btn btn-accent mt-3">
                Go to Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
