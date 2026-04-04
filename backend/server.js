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

// ===============================
// CUSTOMER SIGNUP
// ===============================
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

// ===============================
// CUSTOMER LOGIN
// ===============================
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
        message: "Invalid email or password."
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
      message: "Server error."
    });
  }
});

// ===============================
// GET CUSTOMER PROFILE
// ===============================
app.get("/api/customers/profile/:id", async (req, res) => {
  try {
    const customerId = req.params.id;

    const [rows] = await pool.execute(
      `SELECT id, first_name, last_name, email, phone, zip_code
       FROM customers
       WHERE id = ?
       LIMIT 1`,
      [customerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    return res.status(200).json({
      success: true,
      customer: rows[0]
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile."
    });
  }
});

// ===============================
// UPDATE CUSTOMER PROFILE
// ===============================
app.put("/api/customers/profile/:id", async (req, res) => {
  try {
    const customerId = req.params.id;
    const { firstName, lastName, phone, zipCode } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required."
      });
    }

    const [result] = await pool.execute(
      `UPDATE customers
       SET first_name = ?, last_name = ?, phone = ?, zip_code = ?
       WHERE id = ?`,
      [
        firstName,
        lastName,
        phone || null,
        zipCode || null,
        customerId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully."
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile."
    });
  }
});

// ===============================
// BUSINESS SIGNUP
// ===============================
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

// ===============================
// CUSTOMER COUNT
// ===============================
app.get("/api/customers/count", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM customers"
    );

    return res.json({
      success: true,
      total: rows[0].total
    });
  } catch (error) {
    console.error("Count error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch count"
    });
  }
});

// ===============================
// SEARCH BUSINESS BY NAME + ZIP
// ===============================
app.get("/api/business-users/search", async (req, res) => {
  try {
    const businessName = (req.query.businessName || "").trim();
    const zip = (req.query.zip || "").trim();

    if (!businessName || !zip) {
      return res.status(400).json({
        success: false,
        message: "Business name and zip code are required."
      });
    }

    const [rows] = await pool.execute(
      `SELECT
          id,
          businessName,
          ownerName,
          businessType,
          email,
          phone,
          website,
          services,
          city,
          state,
          zip
       FROM business_users
       WHERE businessName LIKE ?
         AND zip = ?
       ORDER BY businessName ASC`,
      [`%${businessName}%`, zip]
    );

    return res.status(200).json({
      success: true,
      businesses: rows
    });
  } catch (error) {
    console.error("Business search error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search businesses."
    });
  }
});

// ===============================
// SUBMIT BUSINESS REVIEW
// ===============================
app.post("/api/reviews/business", async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      businessId,
      businessName,
      businessZip,
      serviceUsed,
      overallRating,
      serviceLocation,
      serviceState,
      reviewTitle,
      wouldRecommend,
      serviceDate,
      valueForMoney,
      reviewText
    } = req.body;

    if (
      !customerName ||
      !businessId ||
      !businessName ||
      !serviceUsed ||
      !overallRating ||
      !serviceLocation ||
      !serviceState ||
      !reviewTitle ||
      !wouldRecommend ||
      !serviceDate ||
      !valueForMoney ||
      !reviewText
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required business review fields."
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO business_reviews (
        customer_id,
        customer_name,
        customer_email,
        business_id,
        business_name,
        business_zip,
        service_used,
        overall_rating,
        service_location,
        service_state,
        review_title,
        would_recommend,
        service_date,
        value_for_money,
        review_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId || null,
        customerName,
        customerEmail || null,
        businessId,
        businessName,
        businessZip || null,
        serviceUsed,
        Number(overallRating),
        serviceLocation,
        serviceState,
        reviewTitle,
        wouldRecommend,
        serviceDate,
        Number(valueForMoney),
        reviewText
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Business review submitted successfully.",
      reviewId: result.insertId
    });
  } catch (error) {
    console.error("Submit business review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit business review."
    });
  }
});

// ===============================
// SUBMIT APP REVIEW
// ===============================
app.post("/api/reviews/app", async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      overallRating,
      serviceUsed,
      address,
      zipCode,
      easeOfUse,
      businessMatchQuality,
      reviewTitle,
      wouldRecommend,
      improvementSuggestion,
      reviewText
    } = req.body;

    if (
      !customerName ||
      !overallRating ||
      !serviceUsed ||
      !address ||
      !zipCode ||
      !easeOfUse ||
      !businessMatchQuality ||
      !reviewTitle ||
      !wouldRecommend ||
      !improvementSuggestion ||
      !reviewText
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required app review fields."
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO app_reviews (
        customer_id,
        customer_name,
        customer_email,
        overall_rating,
        service_used,
        address,
        zip_code,
        ease_of_use,
        business_match_quality,
        review_title,
        would_recommend,
        improvement_suggestion,
        review_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId || null,
        customerName,
        customerEmail || null,
        Number(overallRating),
        serviceUsed,
        address,
        zipCode,
        Number(easeOfUse),
        Number(businessMatchQuality),
        reviewTitle,
        wouldRecommend,
        improvementSuggestion,
        reviewText
      ]
    );

    return res.status(201).json({
      success: true,
      message: "App review submitted successfully.",
      reviewId: result.insertId
    });
  } catch (error) {
    console.error("Submit app review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit app review."
    });
  }
});

// ===============================
// GET BUSINESS REVIEWS BY CUSTOMER
// ===============================
app.get("/api/reviews/business/customer/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const [rows] = await pool.execute(
      `SELECT
          id,
          customer_id,
          customer_name,
          customer_email,
          business_id,
          business_name,
          business_zip,
          service_used,
          overall_rating,
          service_location,
          service_state,
          review_title,
          would_recommend,
          service_date,
          value_for_money,
          review_text,
          created_at
       FROM business_reviews
       WHERE customer_id = ?
       ORDER BY created_at DESC`,
      [customerId]
    );

    return res.status(200).json({
      success: true,
      reviews: rows
    });
  } catch (error) {
    console.error("Get customer business reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer business reviews."
    });
  }
});

// ===============================
// GET APP REVIEWS BY CUSTOMER
// ===============================
app.get("/api/reviews/app/customer/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const [rows] = await pool.execute(
      `SELECT
          id,
          customer_id,
          customer_name,
          customer_email,
          overall_rating,
          service_used,
          address,
          zip_code,
          ease_of_use,
          business_match_quality,
          review_title,
          would_recommend,
          improvement_suggestion,
          review_text,
          created_at
       FROM app_reviews
       WHERE customer_id = ?
       ORDER BY created_at DESC`,
      [customerId]
    );

    return res.status(200).json({
      success: true,
      reviews: rows
    });
  } catch (error) {
    console.error("Get customer app reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer app reviews."
    });
  }
});

// ===============================
// START SERVER
// ===============================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});