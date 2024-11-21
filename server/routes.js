const express = require('express');
// const db = require('./db.js');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./healthcare_data.db');

// Get all users
router.get('/patient_info', (req, res) => {
  db.all('SELECT * FROM Patient_Info', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ patients: rows });
  });
});

// Add a new user
router.post('/', (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO users (name) VALUES (?)", [name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name });
  });
});

module.exports = router;