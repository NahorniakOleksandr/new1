import express from "express";
import db from "./db/database.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

const app = express();
const PORT = 3001;

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Road Requests API is running");
});

/* -------- PRACTICE 5 -------- */

// Request ID
app.use((req, res, next) => {
  const id = Math.random().toString(36).substring(2, 10);
  req.headers["x-request-id"] = id;
  res.setHeader("X-Request-Id", id);
  next();
});

// Timeout
app.use((req, res, next) => {
  res.setTimeout(5000, () => {
    res.status(503).json({ error: "Timeout" });
  });
  next();
});

/* -------- PRACTICE 4 -------- */

// GET all
app.get("/requests", (req, res) => {
  db.all("SELECT * FROM road_requests", (err, rows) => {
    res.json(rows);
  });
});

// POST
app.post("/requests", (req, res) => {
  const { title, address } = req.body;

  db.run(
    "INSERT INTO road_requests (title, address, status) VALUES (?, ?, 'new')",
    [title, address],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

/* -------- PRACTICE 5 TEST -------- */

app.get("/retry", (req, res) => {
  res.setHeader("Retry-After", "5");
  res.status(503).json({ error: "Service unavailable, retry later" });
});

app.get("/slow", (req, res) => {
  setTimeout(() => {
    res.json({ message: "slow response" });
  }, 6000);
});

app.get("/error", (req, res) => {
  throw new Error("Test error");
});

/* -------- SWAGGER -------- */

const swaggerDoc = fs.readFileSync("./docs/api/openapi.yaml", "utf8");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, {
  swaggerOptions: { spec: swaggerDoc }
}));

/* -------- ERROR HANDLER -------- */

app.use((err, req, res, next) => {
  res.status(500).json({
    error: true,
    message: err.message,
    requestId: req.headers["x-request-id"]
  });
});

/* -------- START -------- */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
