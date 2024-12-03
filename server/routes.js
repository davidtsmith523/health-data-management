const express = require("express");
const { signData, decrypt, encrypt } = require("./helpers");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./healthcare_data.db");
const moment = require("moment-timezone");
const fs = require("fs");
const NodeRSA = require("node-rsa");

const rsaPrivateKey = fs.readFileSync("./keys/privateKey.pem", "utf8");
const rsaPublicKey = fs.readFileSync("./keys/publicKey.pem", "utf8");

// Get RSA Public Key
router.get("/get-rsa-public-key", (req, res) => {
  try {
    res.json({ rsaPublicKey });
  } catch (error) {
    console.error("Failed:", error.message);
    res.status(500).json({ error: "Could not get key." });
  }
});

router.post("/sign_patient_info", (req, res) => {
  const { patientData } = req.body;

  try {
    const signature = signData(patientData);
    const patientId = patientData.id;
    const doctorName = patientData.assignedTo;
    const queryInsertSignature = `
        INSERT INTO Signatures (patient_id, signed_off_by, signature)
        VALUES (?, ?, ?)
      `;

    db.run(
      queryInsertSignature,
      [patientId, doctorName, signature],
      function (err) {
        if (err) {
          console.error("Error inserting signature:", err.message);
          return;
        }

        const signatureId = this.lastID; // Get the ID of the inserted signature

        const queryUpdatePatient = `
        UPDATE Patient_Info
        SET signature_id = ?
        WHERE id = ?
      `;

        db.run(queryUpdatePatient, [signatureId, patientId], (err) => {
          if (err) {
            console.error("Error updating patient info:", err.message);
          } else {
            console.log("Patient signed off successfully!");
          }
        });
      }
    );
    res.json({ signature });
  } catch (error) {
    console.error("Signing error:", error.message);
    res.status(500).json({ error: "Failed to sign data." });
  }
});

router.post("/patient_info", (req, res) => {
  const { authenticatedUser, userEmail } = req.body;

  let query = "SELECT * FROM Patient_Info";

  // Retrieve all patient info
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }

    // Decrypt sensitive fields and filter rows
    const filteredRows = rows
      .map((row) => ({
        ...row,
        firstName: decrypt(row.firstName),
        lastName: decrypt(row.lastName),
        email: decrypt(row.email)
      }))
      .filter((row) =>
        authenticatedUser === "patient" ? row.email === userEmail : true
      );

    res.json({ patients: filteredRows });
  });
});

// Add a new patient
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

  if (
    !firstName ||
    !lastName ||
    !email ||
    !dateOfBirth ||
    !lastVisit ||
    !assignedTo ||
    !condition ||
    !action ||
    !status
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Encrypt sensitive fields
  const encryptedFirstName = encrypt(firstName);
  const encryptedLastName = encrypt(lastName);
  const encryptedEmail = encrypt(email);

  const query = `
    INSERT INTO patient_info (firstName, lastName, email, dateOfBirth, lastVisit, assignedTo, condition, action, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    encryptedFirstName,
    encryptedLastName,
    encryptedEmail,
    dateOfBirth,
    lastVisit,
    assignedTo,
    condition,
    action,
    status
  ];

  db.run(query, params, function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to add patient" });
    }

    res
      .status(201)
      .json({ message: "Patient added successfully", patientId: this.lastID });
  });
});

// Edit an existing patient
router.put("/edit_patient_info", (req, res) => {
  const {
    id,
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

  if (!id) {
    return res
      .status(400)
      .json({ error: "Patient ID is required for updating" });
  }

  // Encrypt sensitive fields
  const encryptedFirstName = encrypt(firstName);
  const encryptedLastName = encrypt(lastName);
  const encryptedEmail = encrypt(email);

  const query = `
    UPDATE patient_info
    SET 
      firstName = ?,
      lastName = ?,
      email = ?,
      dateOfBirth = ?,
      lastVisit = ?,
      assignedTo = ?,
      condition = ?,
      action = ?,
      status = ?
    WHERE id = ?
  `;

  const params = [
    encryptedFirstName,
    encryptedLastName,
    encryptedEmail,
    dateOfBirth,
    lastVisit,
    assignedTo,
    condition,
    action,
    status,
    id
  ];

  db.run(query, params, function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to update patient" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json({ message: "Patient updated successfully" });
  });
});

// Delete a patient by email
router.delete("/delete_patient", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Email is required for deletion" });
  }

  const query = `DELETE FROM patient_info WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to delete patient" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "patient not found" });
    }

    res.status(200).json({ message: "patient deleted successfully" });
  });
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
