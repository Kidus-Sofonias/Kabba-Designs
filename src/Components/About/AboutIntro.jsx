import React from "react";
import { Link } from "react-router-dom";
import "./AboutIntro.css";

import img1 from "../../assets/images/main/mimg1.jpg";
import img2 from "../../assets/images/main/img.jpg";
import img3 from "../../assets/images/main/wimg1.jpg";

function AboutIntro() {
  return (
    <section className="about-intro container my-5">
      <div className="row align-items-center">
        {/* LEFT - Images */}
        <div className="col-lg-5 mb-4 mb-lg-0" data-aos="fade-right" data-aos-duration="800">
          <div className="image-stack">
            <img src={img1} alt="Founder" className="img-main" />
            <img src={img2} alt="Jewelry" className="img-overlay" />
            <img src={img3} alt="Woman" className="img-bottom" />
          </div>
        </div>

        {/* RIGHT - Text */}
        <div className="col-lg-7" data-aos="fade-left" data-aos-duration="800" data-aos-delay="200">
          <h2 className="fw-bold">ABOUT KABBA</h2>
          <p>
            Discover Kabba, your go-to brand for authentic African-inspired
            fashion since 2019. Our collection features stunning dress shirts
            and handcrafted jewelry that blend tradition with modern elegance.
          </p>
          <p>
            At Kabba, we believe in fashion with meaning. Our unique styles are
            more than just clothing; they tell a story of culture,
            craftsmanship, and creativity.
          </p>

          <div className="highlight-box p-3 mb-3">
            <h5 className="fw-bold">5 YEARS OF TOP NOTCH DESIGNS</h5>
            <p>
              Kabba has been delivering high-quality, culturally rich
              African-inspired fashion with modern elegance.
            </p>
          </div>

          <div className="highlight-box p-3">
            <h5 className="fw-bold">High-Quality Craftsmanship</h5>
            <p>
              Meticulously crafted, Kabba's fashion pieces showcase high-quality
              craftsmanship, ensuring timeless elegance and lasting durability.
            </p>
          </div>

          <Link to="/about" className="btn btn-accent mt-4">
            LEARN MORE
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AboutIntro;
