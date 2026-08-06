// Central API configuration for Kabba Designs.
//
// On Vercel (or any other host), set the VITE_API_URL environment variable to
// your backend base URL, e.g.:
//   VITE_API_URL=https://your-api.example.com/api
// If it is not set, we fall back to the current production backend.
//
// The backend always serves under /api, so we normalize whatever is provided
// (with or without the trailing /api suffix) to always include it.
const _rawApiUrl = (
  import.meta.env.VITE_API_URL ||
  "https://kabba-designs.onrender.com/api"
).replace(/\/+$/, "");

const API_BASE_URL = _rawApiUrl.endsWith("/api") ? _rawApiUrl : `${_rawApiUrl}/api`;

// The origin of the API (without the /api suffix), used to prefix
// backend-relative image paths such as "/uploads/abc.png".
// NOTE: this assumes VITE_API_URL ends with "/api" (like the default).
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

// Prefix a backend-relative image path with the API origin.
// Absolute URLs (http/https) are returned as-is.
export function imageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}

export { API_ORIGIN, API_BASE_URL };
export default API_BASE_URL;
