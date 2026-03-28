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

// registering new customers
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

// validating customers login 

app.post("/api/customers/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const [users] = await pool.execute(
      `SELECT id, first_name, last_name, email, password_hash
       FROM customers
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "No account found with this email."
      });
    }

    const customer = users[0];

    const passwordMatch = await bcrypt.compare(password, customer.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      customerId: customer.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email
    });
  } catch (error) {
    console.error("Customer login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
});



// registering new business owners

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.post("/api/business/signup", async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      businessType,
      email,
      phone,
      website,
      services,
      addressLine1,
      addressLine2,
      city,
      state,
      zip,
      password,
      terms
    } = req.body;

    if (
      !businessName ||
      !ownerName ||
      !businessType ||
      !email ||
      !phone ||
      !services ||
      !addressLine1 ||
      !city ||
      !state ||
      !zip ||
      !password
    ) {
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
      "SELECT id FROM business_users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Business email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO business_users
       (businessName, ownerName, businessType, email, phone, website, services, addressLine1, addressLine2, city, state, zip, passwordHash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        businessName,
        ownerName,
        businessType,
        email,
        phone,
        website || null,
        services,
        addressLine1,
        addressLine2 || null,
        city,
        state,
        zip,
        passwordHash
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Business account created successfully.",
      businessId: result.insertId
    });
  } catch (error) {
    console.error("Business signup error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});