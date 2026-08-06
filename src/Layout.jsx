import React from "react";
import { useLocation } from "react-router-dom";
import Nav from "./Components/Nav/Nav";
import Footer from "./Components/Footer/Footer";
import ScrollToTop from "./Components/ScrollToTop/ScrollToTop";

function Layout({ children }) {
  const location = useLocation();
  // Keep the site navbar/footer everywhere except in the admin area,
  // so category pages are never dead ends.
  const hideChrome = location.pathname.startsWith("/admin");

  return (
    <div className="app-shell">
      <ScrollToTop />
      {!hideChrome && <Nav />}
      <main className="app-main">{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}

export default Layout;
