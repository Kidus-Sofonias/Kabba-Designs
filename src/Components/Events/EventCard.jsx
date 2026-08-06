import { format, parseISO, isValid } from "date-fns";
import { imageUrl } from "../../config";
import "./EventCard.css";

function formatRange(start, end) {
  if (!start || !end) {
    return { range: "Date unavailable", days: "Unknown" };
  }
  let startDate, endDate;
  try {
    startDate = parseISO(start);
    endDate = parseISO(end);
    if (!isValid(startDate) || !isValid(endDate)) {
      return { range: "Date unavailable", days: "Unknown" };
    }
  } catch {
    return { range: "Date unavailable", days: "Unknown" };
  }

  const startDay = format(startDate, "EEEE");
  const endDay = format(endDate, "EEEE");

  const range = `${format(startDate, "MMMM d")} - ${format(endDate, "MMMM d")}`;
  const days = startDay === endDay ? startDay : `${startDay} and ${endDay}`;

  return { range, days };
}

function EventCard({ event = {} }) {
  const { range, days } = formatRange(event.date, event.end_date);

  const imageSrc = imageUrl(event.image_url);

  return (
    <div className="event-card hover-lift" data-aos="fade-up">
      <a
        href={event.location_link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <img className="event-card-img" src={imageSrc} alt={event.name} />
        <h5>{event.name}</h5>
      </a>
      <p>
        <i>{range}</i>
      </p>
      <p>
        <b>{days}</b>
      </p>
    </div>
  );
}

export default EventCard;
