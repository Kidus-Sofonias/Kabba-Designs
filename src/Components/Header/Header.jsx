import React from "react";
import { Link } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./Header.css";
import { Carousel } from "react-responsive-carousel";

import img1 from "../../assets/images/main/home_bg_1.png";
import img2 from "../../assets/images/main/home_bg_2.png";
import img3 from "../../assets/images/main/home_bg_3.png";

function Header() {
  return (
    <div className="custom-carousel">
      <Carousel
        showThumbs={false}
        autoPlay
        infiniteLoop
        interval={5000}
        showStatus={false}
        swipeable
        emulateTouch
        transitionTime={800}
      >
        {[img1, img2, img3].map((img, index) => (
          <div className="carousel-slide" key={index}>
            <img src={img} alt={`slide-${index}`} />
            <div className="slide-overlay">
              <h1>KABBA DESIGN</h1>
              <p>Authentic African Fashion Since 2019</p>
              <Link to="/products" className="btn btn-warning mt-3">
                Shop Now
              </Link>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default Header;
