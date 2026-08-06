import React from "react";
import "./FabricHighlight.css";
import fabricImage from "../../assets/images/main/first-highlight.jpg"; // Replace with your actual image path

function FabricHighlight() {
  return (
    <section
      className="fabric-section"
      style={{ backgroundImage: `url(${fabricImage})` }}
    >
      <div className="fabric-overlay">
        <div className="container text-white">
          <div className="row">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h1 className="display-5 fw-bold">AFRICAN FABRIC</h1>
              <h3 className="fw-bold">
                RICH, VIBRANT,
                <br />
                TEXTURED, SYMBOLIC
              </h3>
            </div>
            <div className="col-lg-6">
              <p>
                Kabba uses African fabric, which is vibrant, rich, and deeply
                symbolic, blending bold colors with intricate patterns. It
                represents cultural heritage, history, and identity, while
                merging traditional craftsmanship with modern design, creating
                timeless and meaningful pieces.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FabricHighlight;
