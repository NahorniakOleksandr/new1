export default function validateRequest(req, res, next) {
  if (req.method === "POST" && !req.body.title) {
    return res.status(400).json({ error: "Title is required" });
  }
  next();
}