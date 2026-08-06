import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles.css";

import img1 from "../../assets/images/main/mimg1.jpg";
import img2 from "../../assets/images/main/mimg2.jpg";
import img3 from "../../assets/images/main/mimg3.jpg";
import img4 from "../../assets/images/main/mimg4.jpg";
import img5 from "../../assets/images/main/mimg5.jpeg";

function Men() {
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
          MEN'S WEAR
        </h4>
      </div>

      <div className="row-section" data-aos="fade-right">
        <div className="image-stack">
          <img src={img1} alt="modern1" className="img-main yellow-frame" />
          <img src={img2} alt="modern2" className="img-overlay" />
          <img src={img3} alt="modern3" className="img-bottom black-frame" />
        </div>
        <div className="text-section">
          <h3>Elevate Your Style with Kabba</h3>
          <p>
            Discover the vibrant world of African fashion with Kabba, where
            tradition meets modernity in every stitch. Our exquisite men's
            clothing line celebrates the rich heritage of African textiles,
            meticulously crafted for the contemporary man who values style and
            culture. Whether you're dressing for a special occasion or seeking
            stylish everyday wear, our collection offers versatility and
            elegance. Embrace the essence of African culture while enjoying the
            comfort and quality that Kabba is known for.
          </p>
          <Link to="/products?category=men" className="btn btn-accent me-2">
            SHOP THE COLLECTION
          </Link>
          <Link to="/contact" className="btn btn-warning">
            CONTACT US
          </Link>
        </div>
      </div>

      <div className="row-section reverse" data-aos="fade-left">
        <div className="image-stack">
          <img src={img4} alt="traditional1" className="img-main black-frame" />
          <img
            src={img5}
            alt="traditional2"
            className="img-overlay yellow-frame"
          />
        </div>
        <div className="text-section">
          <h3>
            Redefine the Timeless Elegance of Ethiopian Traditional Clothing
            with Kabba
          </h3>
          <p>
            Step into a realm of rich culture and history with Kabba's exclusive
            collection of Ethiopian traditional clothing. Our garments celebrate
            the intricate artistry and vibrant heritage of Ethiopia, designed
            for the modern man who appreciates the beauty of tradition.
          </p>
          <Link to="/products?category=men" className="btn btn-accent me-2">
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

export default Men;
