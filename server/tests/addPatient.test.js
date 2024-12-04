const request = require("supertest");
const express = require("express");
const { encrypt } = require("../helpers");
const app = express();
const router = express.Router();

// Mock the encrypt function
jest.mock("../helpers", () => ({
  encrypt: jest.fn((value) => `encrypted_${value}`)
}));

// Mock the db.run function
const db = {
  run: jest.fn((query, params, callback) => {
    callback(null); // Simulate success
  })
};

app.use(express.json());

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

app.use(router);

describe("POST /add_patient_info", () => {
  it("should return 400 if any required field is missing", async () => {
    const res = await request(app).post("/add_patient_info").send({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      dateOfBirth: "1990-01-01",
      lastVisit: "2024-12-01",
      assignedTo: "Dr. Smith",
      condition: "Condition X",
      action: "Action Y"
      // Missing 'status' field
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("All fields are required");
  });

  it("should return 201 if the patient is added successfully", async () => {
    const res = await request(app).post("/add_patient_info").send({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      dateOfBirth: "1990-01-01",
      lastVisit: "2024-12-01",
      assignedTo: "Dr. Smith",
      condition: "Condition X",
      action: "Action Y",
      status: "Active"
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Patient added successfully");
  });

  it("should handle database errors correctly", async () => {
    // Mock the db.run function to simulate an error
    db.run.mockImplementationOnce((query, params, callback) => {
      callback(new Error("Database error"));
    });

    const res = await request(app).post("/add_patient_info").send({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      dateOfBirth: "1990-01-01",
      lastVisit: "2024-12-01",
      assignedTo: "Dr. Smith",
      condition: "Condition X",
      action: "Action Y",
      status: "Active"
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to add patient");
  });
});
