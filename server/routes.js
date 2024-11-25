const express = require('express');
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
router.post('/add_patient_info', (req, res) => {
  const { name } = req.body;

  const sql = `
  INSERT INTO Patient_Info (first_name, last_name, dob, last_visit, action_required, status, condition, doctor_assigned) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [req.body.firstName, req.body.lastName, req.body.dateOfBirth, req.body.lastVisit, req.body.action, req.body.status, req.body.condition, req.body.assignedTo];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name });
  });
});

module.exports = router;