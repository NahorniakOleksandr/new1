import express from "express";
import db from "../db/database.js";

const router = express.Router();

// GET all
router.get("/", (req, res) => {
  db.all("SELECT * FROM requests", (err, rows) => {
    res.json(rows);
  });
});

// GET by id
router.get("/:id", (req, res) => {
  db.get(
    "SELECT * FROM requests WHERE id = ?",
    [req.params.id],
    (err, row) => {
      res.json(row);
    }
  );
});

// POST
router.post("/", (req, res) => {
  const { title, address } = req.body;

  db.run(
    "INSERT INTO requests (title, address, status) VALUES (?, ?, 'new')",
    [title, address],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

// PUT
router.put("/:id", (req, res) => {
  const { status } = req.body;

  db.run(
    "UPDATE requests SET status = ? WHERE id = ?",
    [status, req.params.id],
    () => res.json({ updated: true })
  );
});

// DELETE
router.delete("/:id", (req, res) => {
  db.run(
    "DELETE FROM requests WHERE id = ?",
    [req.params.id],
    () => res.json({ deleted: true })
  );
});

export default router;