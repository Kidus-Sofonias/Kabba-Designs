import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles.css";

import img1 from "../../assets/images/main/wimg1.jpg";
import img2 from "../../assets/images/main/wimg2.jpeg";
import img3 from "../../assets/images/main/wimg3.jpg";
import img4 from "../../assets/images/main/wimg4.jpg";
import img5 from "../../assets/images/main/wimg5.jpg";

function Women() {
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
          style={{ marginLeft: "20px", marginTop: "10px", fontWeight: "bold" }}
        >
          WOMEN'S WEAR
        </h4>
      </div>

      {/* Section 1: Modern Workwear */}
      <div className="row-section" data-aos="fade-right">
        <div className="image-stack">
          <img src={img1} alt="workwear1" className="img-main yellow-frame" />
          <img src={img2} alt="workwear2" className="img-overlay" />
          <img src={img3} alt="workwear3" className="img-bottom black-frame" />
        </div>
        <div className="text-section">
          <h3>Introducing Kabba Women's African Workwear Collection!</h3>
          <p>
            Discover Kabba's exclusive line of African-inspired professional
            wear for women. Our collection fuses tradition and sophistication
            for confident, elegant women in any workplace.
          </p>
          <Link to="/products?category=women" className="btn btn-accent me-2">
            SHOP THE COLLECTION
          </Link>
          <Link to="/contact" className="btn btn-warning">
            CONTACT US
          </Link>
        </div>
      </div>

      <div className="row-section reverse" data-aos="fade-left">
        <div className="image-stack">
          <img
            src={img4}
            alt="Traditional Dress 1"
            className="img-main black-frame"
          />
          <img
            src={img5}
            alt="Traditional Dress 2"
            className="img-overlay yellow-frame"
          />
        </div>

        <div className="text-section">
          <h3>Discover the Elegance of Ethiopian Tradition with Kabba!</h3>
          <p>
            Step into a world of vibrant colors, rich heritage, and timeless
            beauty with our exquisite Ethiopian traditional dresses, handcrafted
            by Kabba. Each piece is a stunning reflection of Ethiopia's diverse
            cultures and artistry, designed to celebrate the spirit of tradition
            and individuality.
          </p>
          <Link to="/products?category=women" className="btn btn-accent me-2">
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

export default Women;
