import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import AboutIntro from "../../Components/About/AboutIntro";
import "./About.css";

function About() {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <section className="about-page">
      <AboutIntro />

      {/* Mission */}
      <div className="container mission-section py-5">
        <h2 className="text-center mb-4 fw-bold">OUR MISSION</h2>
        <p className="text-center mb-4">
          At Kabba, we celebrate the soul of Africa through fashion. Our goal is
          to reconnect heritage with style — empowering people to wear
          meaningful clothing that tells a story of culture, pride, and
          artistry.
        </p>
        <p className="text-center mb-4">
          We work with local designers and artisans to create authentic
          African-inspired clothing that fuses tradition with modern aesthetics.
          From fabric to fit, every piece is crafted to make a statement — bold,
          proud, and timeless.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-section bg-light py-5">
        <div className="container text-center">
          <h2 className="mb-5 fw-bold">OUR IMPACT</h2>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="stat-box">
                <h1>500+</h1>
                <p>Products Sold</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-box">
                <h1>5+</h1>
                <p>Years in Business</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-box">
                <h1>60+</h1>
                <p>Unique Designs</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-box">
                <h1>200+</h1>
                <p>Satisfied Customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline-section container py-5">
        <h2 className="text-center mb-5 fw-bold">OUR JOURNEY</h2>
        <div className="timeline-line">
          {[
            {
              year: "2019",
              title: "Founded Kabba",
              desc: "Kabba was born from a passion for African fashion and culture.",
            },
            {
              year: "2020",
              title: "100+ Sales",
              desc: "Reached over 100 product sales with hand-delivered customer service.",
            },
            {
              year: "2021",
              title: "New Categories",
              desc: "Launched jewelry and children’s wear collections.",
            },
            {
              year: "2023",
              title: "Expo Showcase",
              desc: "Featured at local fashion expos in Addis Ababa.",
            },
            {
              year: "2024",
              title: "500+ Products Sold",
              desc: "Grew our base to 200+ loyal customers and 500+ products sold.",
            },
          ].map((event, index) => (
            <div className="timeline-entry" key={index} data-aos="fade-up">
              <div className="timeline-marker">
                <span className="year">{event.year}</span>
              </div>
              <div className="timeline-detail">
                <h5>{event.title}</h5>
                <p>{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
