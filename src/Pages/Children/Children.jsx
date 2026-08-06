import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles.css";

import img1 from "../../assets/images/main/cimg1.jpg";
import img2 from "../../assets/images/main/cimg2.jpg";
import img3 from "../../assets/images/main/cimg3.jpg";
import img4 from "../../assets/images/main/cimg4.jpg";
import img5 from "../../assets/images/main/cimg5.jpg";

function Children() {
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
            fontSize: "1.8rem",
          }}
        >
          CHILDREN'S WEAR
        </h4>
      </div>

      <div className="row-section" data-aos="fade-right">
        <div className="image-stack">
          <img src={img1} alt="kid1" className="img-main yellow-frame" />
          <img src={img2} alt="kid2" className="img-overlay" />
          <img src={img3} alt="kid3" className="img-bottom black-frame" />
        </div>
        <div className="text-section">
          <h3>Dress Your Little Ones in Joy with Kabba!</h3>
          <p>
            Celebrate culture with Kabba's enchanting traditional children's
            clothing — playful, bright, and full of personality. Every stitch is
            lovingly crafted for comfort and tradition.
          </p>
          <Link to="/products?category=children" className="btn btn-accent me-2">
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
          style={{ position: "relative", width: "360px", minWidth: "280px" }}
        >
          <img
            src={img4}
            alt="Traditional Kidswear 1"
            className="img-main"
            style={{
              width: "100%",
              border: "8px solid black",
              borderRadius: "6px",
            }}
          />
          <img
            src={img5}
            alt="Traditional Kidswear 2"
            className="img-overlay"
            style={{
              position: "absolute",
              width: "75%",
              top: "30px",
              left: "-50px",
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
          <h3>
            Celebrate Culture with Kabba's Ethiopian Traditional Cloth for Kids!
          </h3>
          <p>
            Introduce your little ones to the beauty of Ethiopian heritage with
            Kabba's enchanting traditional garments! Each piece is lovingly
            crafted, blending timeless designs with the playful spirit of
            childhood.
          </p>
          <Link to="/products?category=children" className="btn btn-accent me-2">
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

export default Children;
