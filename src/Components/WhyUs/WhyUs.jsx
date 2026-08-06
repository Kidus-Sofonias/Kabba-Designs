import React from "react";
import "./WhyUs.css";
import { FaHandsHelping, FaGlobeAfrica, FaGem, FaAward } from "react-icons/fa";

function WhyUs() {
return (
    <section className="whyus-section py-5">
    <div className="container text-center">
        <h2 className="section-title">WHY US?</h2>
        <hr className="underline" />

        <div className="row mt-5 text-start">
        <div className="col-md-6 col-lg-3 mb-4">
            <div className="whyus-item">
            <FaHandsHelping className="whyus-icon" />
            <h5 className="fw-bold">Authentic Craftsmanship</h5>
            <p>
                Kabba offers meticulously handcrafted pieces, ensuring
                exceptional quality and attention to detail.
            </p>
            </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-4">
            <div className="whyus-item">
            <FaGlobeAfrica className="whyus-icon" />
            <h5 className="fw-bold">Cultural Connection</h5>
            <p>
                Each design is inspired by rich African heritage, offering a
                unique blend of tradition and modern style.
            </p>
            </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-4">
            <div className="whyus-item">
            <FaGem className="whyus-icon" />
            <h5 className="fw-bold">Exclusive Designs</h5>
            <p>
                Kabba’s collections feature one-of-a-kind dress shirts and
                jewelry that make a bold fashion statement.
            </p>
            </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-4">
            <div className="whyus-item">
            <FaAward className="whyus-icon" />
            <h5 className="fw-bold">Trusted Brand</h5>
            <p>
                With a strong reputation since 2019, Kabba is a reliable choice
                for high-quality, meaningful fashion.
            </p>
            </div>
        </div>
        </div>
    </div>
    </section>
);
}

export default WhyUs;
// This component highlights the unique selling points of Kabba, emphasizing craftsmanship, cultural connection, exclusive designs, and brand trustworthiness.