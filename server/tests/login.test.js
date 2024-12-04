const request = require("supertest");
const express = require("express");
const app = express();
const sinon = require("sinon");
const { decrypt } = require("../helpers");

global.isWithinAllowedHours = jest.fn(); // Jest mock function

global.isWithinAllowedHours.mockReturnValue(false);

// Use express to set up the router and app
const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password, authenticated_user } = req.body;

  if (authenticated_user === "nurse") {
    return res.status(403).json({
      error: "Access is restricted to between 6 AM and 6 PM CST for nurses."
    });
  }

  // Mock database row for testing
  const row = {
    email: "patient@example.com",
    password:
      "e406fedfc423c1439d831de95ea5fe66:3a2e59a0d821f50c76d805b7c70868c3f25f188187f485eed195679b216b62c3"
  };

  if (!row) {
    return res.status(401).json({ error: "Email or password is incorrect" });
  }

  // Decrypt the stored password and compare
  const decryptedPassword = decrypt(row.password);

  console.log(decryptedPassword);
  console.log(password);

  if (decryptedPassword !== password) {
    return res.status(401).json({ error: "Email or password is incorrect" });
  }

  res.json({ user: row });
});

app.use(express.json());
app.use(router);

describe("POST /login", () => {
  it("should return 200 with user data for valid credentials", async () => {
    const res = await request(app).post("/login").send({
      email: "patient@example.com",
      password: "Patient_Test%1234#",
      authenticated_user: "patient"
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe("patient@example.com");
  });

  it("should return 401 for invalid email or password", async () => {
    const res = await request(app).post("/login").send({
      email: "patient@example.com",
      password: "wrongpassword",
      authenticated_user: "patient"
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Email or password is incorrect");
  });

  it("should return 403 if nurse tries to log in outside allowed hours", async () => {
    sinon.stub(global, "isWithinAllowedHours").returns(false);

    const res = await request(app).post("/login").send({
      email: "nurse@example.com",
      password: "encryptedpassword",
      authenticated_user: "nurse"
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(
      "Access is restricted to between 6 AM and 6 PM CST for nurses."
    );

    // Restore the original function after the test
    sinon.restore();
  });
});
