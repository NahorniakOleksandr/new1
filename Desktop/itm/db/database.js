import sqlite3 from "sqlite3";

const db = new sqlite3.Database("database.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      address TEXT,
      status TEXT
    )
  `);
});

export default db;
