const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Estimator backend is running.");
});

app.post("/api/customers/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, zip, password, terms } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing."
      });
    }

    if (!terms) {
      return res.status(400).json({
        success: false,
        message: "Please accept the terms."
      });
    }

    const [existingUsers] = await pool.execute(
      "SELECT id FROM customers WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO customers
       (first_name, last_name, email, phone, zip_code, password_hash, terms_accepted)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        email,
        phone || null,
        zip || null,
        passwordHash,
        terms ? 1 : 0
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      customerId: result.insertId
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});