const express = require("express");
const { decrypt, encrypt } = require("./helpers");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./healthcare_data.db");

// Get all users
router.get("/patient_info", (req, res) => {
  db.all("SELECT * FROM Patient_Info", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ patients: rows });
  });
});

// Add a new user
router.post("/add_patient_info", (req, res) => {
  const { name } = req.body;

  const sql = `
  INSERT INTO Patient_Info (first_name, last_name, dob, last_visit, action_required, status, condition, doctor_assigned) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    req.body.firstName,
    req.body.lastName,
    req.body.dateOfBirth,
    req.body.lastVisit,
    req.body.action,
    req.body.status,
    req.body.condition,
    req.body.assignedTo
  ];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name });
  });
});

// Check email and password login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM patient_login WHERE email = ?", [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(401).json({ error: "Email or password is incorrect" });
    }

    // Decrypt the stored password and compare
    const decryptedPassword = decrypt(row.password); // Assuming the password is stored as encrypted

    if (decryptedPassword !== password) {
      return res.status(401).json({ error: "Email or password is incorrect" });
    }

    res.json({ user: row });
  });
});

router.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Encrypt the password before storing it
  const encryptedPassword = encrypt(password);

  // Insert into the database (example for SQLite)
  db.run(
    "INSERT INTO patient_login (email, password) VALUES (?, ?)",
    [email, encryptedPassword],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "User registered successfully" });
    }
  );
});

module.exports = router;
