const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./healthcare_data.db');

// Create table if it doesn't exist
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)");
});

module.exports = db;