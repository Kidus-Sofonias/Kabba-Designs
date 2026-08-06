import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5 text-center" style={{ minHeight: "60vh" }}>
      <h1 className="display-3 fw-bold">404</h1>
      <p className="muted mb-4">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/" className="btn btn-accent">
        Back to Home
      </Link>
    </div>
  );
}
