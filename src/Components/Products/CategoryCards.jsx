import React from "react";
import { Link } from "react-router-dom";
import "./CategoryCards.css";

import womenImg from "../../assets/images/main/wimg1.jpg";
import menImg from "../../assets/images/main/mimg1.jpg";
import childImg from "../../assets/images/main/cimg1.jpg";
import jewelryImg from "../../assets/images/main/img.jpg";

const categories = [
{
    title: "WOMEN'S WEAR",
    subtitle: "EMPOWERING, VIBRANT, FEMININE",
    image: womenImg,
    route: "/women",
},
{
    title: "MEN'S WEAR",
    subtitle: "STRONG, DISTINGUISHED, MANLY",
    image: menImg,
    route: "/men",
},
{
    title: "CHILDREN'S",
    subtitle: "PLAYFUL, BRIGHT, ADORABLE",
    image: childImg,
    route: "/children",
},
{
    title: "JEWELRY",
    subtitle: "TIMELESS, INTRICATE, CULTURAL",
    image: jewelryImg,
    route: "/jewelry",
},
];

function CategoryCards() {
return (
    <section className="category-grid container my-5">
    <h2 className="text-center mb-2" data-aos="fade-up">OUR COLLECTIONS</h2>
    <hr className="mb-5" style={{ width: 100, height: 3, background: 'var(--accent)', border: 'none', margin: '0 auto 2rem' }} />
    <div className="row g-4">
        {categories.map((cat, i) => (
        <div className="col-md-6 col-lg-6" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
            <div
            className="category-card"
            style={{ backgroundImage: `url(${cat.image})` }}
            >
            <div className="category-overlay text-center">
                <h3>{cat.title}</h3>
                <p>{cat.subtitle}</p>
                <div className="btn-group gap-2">
                <Link to="/contact" className="btn btn-warning">
                    CONTACT US
                </Link>
                <Link to={cat.route} className="btn btn-warning">
                    LEARN MORE
                </Link>
                </div>
            </div>
            </div>
        </div>
        ))}
    </div>
    </section>
);
}

export default CategoryCards;
