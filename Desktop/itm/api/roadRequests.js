import express from "express";
import db from "../db/database.js";

const router = express.Router();

// GET all
router.get("/", (req, res) => {
  db.all("SELECT * FROM road_requests", (err, rows) => {
    res.json(rows);
  });
});

// POST
router.post("/", (req, res) => {
  const { title, address } = req.body;

  db.run(
    "INSERT INTO road_requests (title, address, status) VALUES (?, ?, 'new')",
    [title, address],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

export default router;
