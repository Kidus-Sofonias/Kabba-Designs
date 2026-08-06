import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Header from "../../Components/Header/Header";
import AboutIntro from "../../Components/About/AboutIntro";
import FabricHighlight from "../../Components/Desc/FabricHighlight";
import CategoryCards from "../../Components/Products/CategoryCards";
import WhyUs from "../../Components/WhyUs/WhyUs";
import EventCard from "../../Components/Events/EventCard";
import Contact from "../../Components/Contact/Contact";
import axios from "../../api/axios";

function Home() {
  const location = useLocation();
  const categoriesRef = useRef();

  // Add state for upcoming events
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    // Fetch only upcoming events for home page
    axios
      .get("/events")
      .then((res) => {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const upcoming = res.data.filter((e) => {
          const start = new Date(e.date);
          const startDate = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate()
          );
          return startDate > today;
        });
        setUpcomingEvents(upcoming);
      })
      .catch(() => {
        setUpcomingEvents([]);
      });
  }, []);

  useEffect(() => {
    if (location.state?.scrollTo === "categories") {
      setTimeout(() => {
        categoriesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); // wait for render
    }
  }, [location]);
  return (
    <div>
      <Header />
      <AboutIntro />
      <FabricHighlight />
      <div ref={categoriesRef}>
        <CategoryCards />
      </div>
      {/* Upcoming Events Section */}
      <section className="home-upcoming-events my-5">
        <h2 className="text-center" data-aos="fade-up">Upcoming Events</h2>
        <hr className="mb-4 home-underline" />
        <div
          className="event-cards-row"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          {upcomingEvents.length === 0 ? (
            <p>No upcoming events.</p>
          ) : (
            upcomingEvents
              .slice(0, 3)
              .map((event, idx) => <EventCard key={idx} event={event} />)
          )}
        </div>
      </section>
      <WhyUs />
      {/* Remove <Events /> here to avoid duplicate sections */}
      <Contact />
    </div>
  );
}

export default Home;
