import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles.css";

import img1 from "../../assets/images/main/img.jpg";
import img2 from "../../assets/images/main/img2.jpg";
import img3 from "../../assets/images/main/img3.jpg";
import img4 from "../../assets/images/main/img4.jpg";
import img5 from "../../assets/images/main/img5.jpg";

function Jewelry() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/", {
      state: { scrollTo: "categories" },
    });
  };

  return (
    <section className="category-detail">
      <div
        style={{
          background: "var(--accent)",
          color: "var(--bg)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <button
          onClick={handleBack}
          style={{ background: "none", border: "none", fontSize: "2.5rem" }}
          aria-label="Back to home"
        >
          ←
        </button>
        <h4
          style={{
            marginLeft: "20px",
            marginTop: "10px",
            fontWeight: "bold",
          }}
        >
          JEWELRY WEAR
        </h4>
      </div>

      <div className="row-section" data-aos="fade-right">
        <div className="image-stack">
          <img src={img1} alt="jewelry1" className="img-main yellow-frame" />
          <img src={img2} alt="jewelry2" className="img-overlay" />
          <img src={img3} alt="jewelry3" className="img-bottom black-frame" />
        </div>
        <div className="text-section">
          <h3>Embrace Tradition with Kabba's Handmade Jewelry</h3>
          <p>
            Discover exquisite craftsmanship where each piece tells a story of
            heritage and elegance. Kabba's jewelry is timeless, intricate, and
            designed for every occasion.
          </p>
          <Link to="/products?category=jewelry" className="btn btn-accent me-2">
            SHOP THE COLLECTION
          </Link>
          <Link to="/contact" className="btn btn-warning">
            CONTACT US
          </Link>
        </div>
      </div>

      <div
        className="row-section reverse"
        data-aos="fade-left"
        style={{ alignItems: "flex-start", gap: "60px" }}
      >
        <div
          className="image-stack"
          style={{
            position: "relative",
            width: "360px",
            minWidth: "280px",
          }}
        >
          <img
            src={img4}
            alt="Jewelry Display 1"
            className="img-main"
            style={{
              width: "100%",
              border: "8px solid black",
              borderRadius: "6px",
            }}
          />
          <img
            src={img5}
            alt="Jewelry Display 2"
            className="img-overlay"
            style={{
              position: "absolute",
              width: "75%",
              top: "90px",
              left: "130px",
              border: "6px solid var(--accent)",
              borderRadius: "6px",
              backgroundColor: "white",
              zIndex: 2,
            }}
          />
        </div>

        <div
          className="text-section"
          style={{ maxWidth: "550px", paddingTop: "40px" }}
        >
          <h3>Embrace Tradition with Kabba's Handmade Ethiopian Jewelry!</h3>
          <p>
            Discover the exquisite craftsmanship of Kabba's jewelry, where each
            handmade piece beautifully combines traditional artistry with modern
            design. Every item is a celebration of culture and creativity,
            perfect for any occasion.
          </p>
          <Link to="/products?category=jewelry" className="btn btn-accent me-2">
            SHOP THE COLLECTION
          </Link>
          <Link to="/contact" className="btn btn-warning">
            CONTACT US
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Jewelry;
