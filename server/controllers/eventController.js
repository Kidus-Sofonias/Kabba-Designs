const { put } = require("@vercel/blob");
const pool = require("../config/db");

exports.getEvents = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("getEvents error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.addEvent = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file received" });

    const { name, start_date, end_date, location_link } = req.body;

    // Upload the event image (multer memory storage → buffer) to Vercel Blob
    const uploaded = await put(
      `kabba-events/${req.file.originalname || "event.jpg"}`,
      req.file.buffer,
      {
        access: "public",
        addRandomSuffix: true,
        contentType: req.file.mimetype || "image/jpeg",
      }
    );

    const sql = `INSERT INTO events (name, date, end_date, location_link, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const values = [name, start_date, end_date, location_link, uploaded.url];

    const dbRes = await pool.query(sql, values);
    res.json({ message: "Event uploaded", id: dbRes.rows[0].id });
  } catch (err) {
    console.error("addEvent error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, start_date, end_date, location_link } = req.body;

    // If a new image was uploaded, upload it to Blob
    let imageUrl = null;
    if (req.file) {
      const uploaded = await put(
        `kabba-events/${req.file.originalname || "event.jpg"}`,
        req.file.buffer,
        {
          access: "public",
          addRandomSuffix: true,
          contentType: req.file.mimetype || "image/jpeg",
        }
      );
      imageUrl = uploaded.url;
    }

    const sql = imageUrl
      ? `UPDATE events SET name=$1, date=$2, end_date=$3, location_link=$4, image_url=$5 WHERE id=$6 RETURNING id`
      : `UPDATE events SET name=$1, date=$2, end_date=$3, location_link=$4 WHERE id=$5 RETURNING id`;

    const values = imageUrl
      ? [name, start_date, end_date, location_link, imageUrl, id]
      : [name, start_date, end_date, location_link, id];

    const result = await pool.query(sql, values);
    if (result.rowCount === 0) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event updated" });
  } catch (err) {
    console.error("updateEvent error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM events WHERE id=$1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("deleteEvent error:", err);
    res.status(500).json({ error: err.message });
  }
};
