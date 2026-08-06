import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

// Safely load the cart from localStorage (never crash on corrupt data).
function loadCart() {
  try {
    const raw = localStorage.getItem("cart");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const initialState = { cart: loadCart() };

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const exists = state.cart.find((item) => item.id === action.payload.id);
      return {
        ...state,
        cart: exists
          ? state.cart.map((item) =>
              item.id === action.payload.id
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
            )
          : [...state.cart, { ...action.payload, quantity: 1 }],
      };
    }
    case "INCREMENT":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        ),
      };
    case "DECREMENT":
      return {
        ...state,
        cart: state.cart
          .map((item) =>
            item.id === action.payload
              ? { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) }
              : item
          ),
      };
    case "REMOVE":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };
    case "CLEAR":
      return { ...state, cart: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(state.cart));
    } catch {
      /* storage may be unavailable (private mode etc.) */
    }
  }, [state.cart]);

  const addToCart = (item) => dispatch({ type: "ADD", payload: item });
  const increment = (id) => dispatch({ type: "INCREMENT", payload: id });
  const decrement = (id) => dispatch({ type: "DECREMENT", payload: id });
  const removeItem = (id) => dispatch({ type: "REMOVE", payload: id });
  const clearCart = () => dispatch({ type: "CLEAR" });
  const getTotal = () =>
    state.cart.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      return sum + price * (item.quantity || 1);
    }, 0);

  return (
    <CartContext.Provider
      value={{
        cart: state.cart,
        addToCart,
        increment,
        decrement,
        removeItem,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
