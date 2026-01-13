import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import db from "./db/database.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import logger from "./middlewares/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3003;
app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname,"public/index.html"));
});
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(express.static(path.join(__dirname, "public")));

/* REQUEST ID */
app.use((req, res, next) => {
  const id = Math.random().toString(36).substring(2, 10);
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
});

/* TIMEOUT */
app.use((req, res, next) => {
  res.setTimeout(5000, () => {
    res.status(503).json({ error: "Timeout" });
  });
  next();
});

/* HEALTH */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ---------- CRUD ---------- */

// GET ALL
app.get("/requests", (req, res) => {
  db.all("SELECT * FROM requests", (err, rows) => {
    res.json(rows);
  });
});

// GET BY ID
app.get("/requests/:id", (req, res) => {
  db.get(
    "SELECT * FROM requests WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (!row) return res.status(404).json({ error: "Not found" });
      res.json(row);
    }
  );
});

// CREATE
app.post("/requests", (req, res) => {
  console.log("BODY:", req.body);

  const { title, address } = req.body;

  if (!title || !address) {
    return res.status(400).json({ error: "Missing data" });
  }

  db.run(
    "INSERT INTO requests(title,address,status) VALUES(?,?, 'new')",
    [title, address],
    function () {
      res.status(201).json({ id: this.lastID });
    }
  );
});

// UPDATE
app.put("/requests/:id", (req, res) => {
  const { title, address, status } = req.body;

  db.run(
    "UPDATE requests SET title=?, address=?, status=? WHERE id=?",
    [title, address, status, req.params.id],
    function () {
      if (this.changes === 0)
        return res.status(404).json({ error: "Not found" });
      res.json({ updated: true });
    }
  );
});

// DELETE
app.delete("/requests/:id", (req, res) => {
  db.run(
    "DELETE FROM requests WHERE id=?",
    [req.params.id],
    function () {
      if (this.changes === 0)
        return res.status(404).json({ error: "Not found" });
      res.json({ deleted: true });
    }
  );
});

/* ---------- PRACTICE 5 ---------- */

app.get("/retry", (req, res) => {
  res.setHeader("Retry-After", "5");
  res.status(503).json({ error: "Service unavailable" });
});

app.get("/slow", (req, res) => {
  setTimeout(() => {
    res.json({ message: "slow response" });
  }, 6000);
});

app.get("/error", (req, res) => {
  throw new Error("Test error");
});

/* ---------- SWAGGER ---------- */

const swaggerDoc = YAML.load("./docs/api/openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

/* ---------- ERROR HANDLER ---------- */

app.use((err, req, res, next) => {
  res.status(500).json({
    error: true,
    message: err.message,
    requestId: req.requestId
  });
});

/* ---------- 404 ---------- */

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

/* ---------- START ---------- */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});