import React, { useEffect, useState } from "react";
import axios from "../../api/axios"; // use your axios instance if available
import EventCard from "../../Components/Events/EventCard";
import "./Events.css";

function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [presentEvents, setPresentEvents] = useState([]);
  const [previousEvents, setPreviousEvents] = useState([]);

  useEffect(() => {
    axios
      .get("/events")
      .then((res) => {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        const upcoming = [];
        const present = [];
        const previous = [];

        res.data.forEach((e) => {
          const start = new Date(e.date);
          const end = new Date(e.end_date);

          // Remove time for accurate comparison
          const startDate = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate()
          );
          const endDate = new Date(
            end.getFullYear(),
            end.getMonth(),
            end.getDate()
          );

          if (startDate > today) {
            upcoming.push(e);
          } else if (startDate <= today && endDate >= today) {
            present.push(e);
          } else if (endDate < today) {
            previous.push(e);
          }
        });

        setUpcomingEvents(upcoming);
        setPresentEvents(present);
        setPreviousEvents(previous);
      })
      .catch((err) => {
        console.error("Failed to fetch events", err);
      });
  }, []);

  return (
    <section className="events-section py-5">
      <div className="container text-center">
        <h2 className="events-title">OUR UPCOMING EVENTS</h2>
        <hr className="events-underline mb-5" />
        <div className="event-cards-row">
          {upcomingEvents.length === 0 ? (
            <p>No upcoming events.</p>
          ) : (
            upcomingEvents.map((event, idx) => (
              <EventCard key={idx} event={event} />
            ))
          )}
        </div>

        <h2 className="events-title mt-5">PRESENT EVENTS</h2>
        <hr className="events-underline mb-5" />
        <div className="event-cards-row">
          {presentEvents.length === 0 ? (
            <p>No present events.</p>
          ) : (
            presentEvents.map((event, idx) => (
              <EventCard key={idx} event={event} />
            ))
          )}
        </div>

        <h2 className="events-title mt-5">PREVIOUS EVENTS</h2>
        <hr className="events-underline mb-5" />
        <div className="event-cards-row">
          {previousEvents.length === 0 ? (
            <p>No previous events yet.</p>
          ) : (
            previousEvents.map((event, idx) => (
              <EventCard key={idx} event={event} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Events;
