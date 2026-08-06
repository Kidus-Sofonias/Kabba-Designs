import React, { useRef, useState } from "react";
import api from "../../api/axios";

function EventForm() {
  const [event, setEvent] = useState({
    name: "",
    start_date: "",
    end_date: "",
    location_link: "",
  });
  const fileRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", event.name);
    fd.append("start_date", event.start_date);
    fd.append("end_date", event.end_date);
    fd.append("location_link", event.location_link);

    const file = fileRef.current?.files[0];
    if (!file) return alert("Please select an image.");
    fd.append("image", file);

    try {
      await api.post("/events", fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Event uploaded");
      setEvent({ name: "", start_date: "", end_date: "", location_link: "" });
      fileRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleChange = (e) =>
    setEvent({ ...event, [e.target.name]: e.target.value });

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <h4>Add Event</h4>
      <input
        name="name"
        placeholder="Name"
        className="form-control mb-2"
        value={event.name}
        onChange={handleChange}
      />
      <input
        name="start_date"
        type="date"
        className="form-control mb-2"
        placeholder="Start Date"
        value={event.start_date}
        onChange={handleChange}
      />
      <input
        name="end_date"
        type="date"
        className="form-control mb-2"
        placeholder="End Date"
        value={event.end_date}
        onChange={handleChange}
      />
      <input
        name="location_link"
        placeholder="Google Location Link"
        className="form-control mb-2"
        value={event.location_link}
        onChange={handleChange}
      />
      <input
        type="file"
        name="image"
        className="form-control mb-3"
        ref={fileRef}
      />

      <button type="submit" className="btn btn-warning">
        Upload
      </button>
    </form>
  );
}

export default EventForm;
