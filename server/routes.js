const express = require("express");
const { decrypt, encrypt } = require("./helpers");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./healthcare_data.db");
const moment = require("moment-timezone");

// Get all users
router.post("/patient_info", (req, res) => {
  const { authenticatedUser, userEmail } = req.body;

  let query = "SELECT * FROM Patient_Info";
  let params = [];

  // If authenticatedUser is 'patient', filter by email
  if (authenticatedUser === "patient" && userEmail) {
    query += " WHERE email = ?";
    params.push(userEmail);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ patients: rows });
  });
});

// Route to add new patient info
router.post("/add_patient_info", (req, res) => {
  const {
    firstName,
    lastName,
    email,
    dateOfBirth,
    lastVisit,
    assignedTo,
    condition,
    action,
    status
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !dateOfBirth) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO Patient_Info 
    (firstName, lastName, email, dateOfBirth, lastVisit, assignedTo, condition, action, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      firstName,
      lastName,
      email,
      dateOfBirth,
      lastVisit,
      assignedTo,
      condition,
      action,
      status
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res
        .status(201)
        .json({ message: "Patient added successfully", id: this.lastID });
    }
  );
});

// Check email and password login
router.post("/login", (req, res) => {
  const { email, password, authenticated_user } = req.body;

  // If the authenticated_user is 'nurse', check if it's within allowed hours (6 AM - 6 PM CST)
  if (authenticated_user === "nurse" && !isWithinAllowedHours()) {
    return res.status(403).json({
      error: "Access is restricted to between 6 AM and 6 PM CST for nurses."
    });
  }

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

// Helper function to check if the time is between 6 AM and 6 PM CST
function isWithinAllowedHours() {
  const currentTime = moment().tz("America/Chicago"); // CST timezone
  const startOfDay = currentTime.clone().startOf("day").add(6, "hours"); // 6 AM
  const endOfDay = currentTime.clone().startOf("day").add(18, "hours"); // 6 PM

  return currentTime.isBetween(startOfDay, endOfDay);
}

module.exports = router;
