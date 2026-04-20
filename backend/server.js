const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Estimator backend is running.");
});

// ===============================
// HELPERS
// ===============================
const ALLOWED_REQUEST_STATUSES = [
  "Pending",
  "Declined",
  "Accepted",
  "Work in progress",
  "Completed"
];

function normalizeRequestStatus(status) {
  const value = String(status || "").trim().toLowerCase();

  if (value === "pending") return "Pending";
  if (value === "declined" || value === "rejected") return "Declined";
  if (value === "accepted") return "Accepted";
  if (value === "work in progress" || value === "in progress" || value === "inprogress") {
    return "Work in progress";
  }
  if (value === "completed" || value === "complete" || value === "done") {
    return "Completed";
  }

  return null;
}

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

    const [existingUsers] = await db.execute(
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

    const [result] = await db.execute(
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

    const [users] = await db.execute(
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
      id: customer.id,
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

    const [existingUsers] = await db.execute(
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

    const [result] = await db.execute(
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
// BUSINESS LOGIN
// ===============================
app.post("/api/business/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const [rows] = await db.execute(
      `SELECT id, businessName, ownerName, email, zip, passwordHash
       FROM business_users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const business = rows[0];
    const match = await bcrypt.compare(password, business.passwordHash);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      business: {
        id: business.id,
        businessName: business.businessName,
        ownerName: business.ownerName,
        email: business.email,
        zip: business.zip
      }
    });
  } catch (error) {
    console.error("Business login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});

// ===============================
// SUBMIT CUSTOMER REQUEST
// ===============================
app.post("/api/requests", async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      zipCode,
      serviceCategory,
      serviceNeeded,
      problemDescription,
      preferredDate,
      preferredTime,
      budget,
      vehicleSource,
      savedVehicleId,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehicleLicensePlate,
      vehicleVin,
      vehicleMileage
    } = req.body;

    const normalizedVehicleSource =
      String(vehicleSource || "").trim().toLowerCase() === "custom"
        ? "custom"
        : "saved";

    if (
      !customerId ||
      !zipCode ||
      !serviceCategory ||
      !serviceNeeded ||
      !problemDescription ||
      !vehicleMake ||
      !vehicleModel
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing."
      });
    }

    if (normalizedVehicleSource === "saved" && !savedVehicleId) {
      return res.status(400).json({
        success: false,
        message: "Saved vehicle is required when using a saved vehicle."
      });
    }

    const [result] = await db.execute(
      `INSERT INTO customer_requests (
        customer_id,
        customer_name,
        customer_email,
        zip_code,
        service_category,
        service_needed,
        problem_description,
        preferred_date,
        preferred_time,
        budget,
        vehicle_source,
        saved_vehicle_id,
        vehicle_make,
        vehicle_model,
        vehicle_year,
        vehicle_color,
        vehicle_license_plate,
        vehicle_vin,
        vehicle_mileage,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        customerName || null,
        customerEmail || null,
        zipCode,
        serviceCategory,
        serviceNeeded,
        problemDescription,
        preferredDate || null,
        preferredTime || null,
        budget || null,
        normalizedVehicleSource,
        normalizedVehicleSource === "saved" ? savedVehicleId : null,
        vehicleMake,
        vehicleModel,
        vehicleYear || null,
        vehicleColor || null,
        vehicleLicensePlate || null,
        vehicleVin || null,
        vehicleMileage || null,
        "Pending"
      ]
    );

    const requestId = result.insertId;

    if (normalizedVehicleSource === "custom") {
      await db.execute(
        `INSERT INTO request_custom_vehicles (
          request_id,
          customer_id,
          make,
          model,
          year,
          color,
          license_plate,
          vin,
          mileage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          requestId,
          customerId,
          vehicleMake,
          vehicleModel,
          vehicleYear || null,
          vehicleColor || null,
          vehicleLicensePlate || null,
          vehicleVin || null,
          vehicleMileage || null
        ]
      );
    }

    return res.status(201).json({
      success: true,
      message: "Request submitted successfully.",
      requestId
    });
  } catch (error) {
    console.error("Submit request error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit request."
    });
  }
});
// ===============================
// GET MY REQUESTS (CUSTOMER SIDE)
// ===============================
app.get("/api/requests/my-requests", async (req, res) => {
  try {
    const customerId = req.query.customer_id;
    const email = (req.query.email || "").trim();

    if (!customerId && !email) {
      return res.status(400).json({
        success: false,
        message: "Customer id or email is required."
      });
    }

    let rows = [];

    if (customerId) {
      const [result] = await db.execute(
        `SELECT
          id,
          customer_id,
          customer_name,
          customer_email,
          zip_code,
          service_category,
          service_needed,
          problem_description,
          preferred_date,
          preferred_time,
          budget,
          vehicle_source,
          saved_vehicle_id,
          vehicle_make,
          vehicle_model,
          vehicle_year,
          vehicle_color,
          vehicle_license_plate,
          vehicle_vin,
          vehicle_mileage,
          status,
          created_at
         FROM customer_requests
         WHERE customer_id = ?
         ORDER BY created_at DESC`,
        [customerId]
      );
      rows = result;
    } else {
      const [result] = await db.execute(
        `SELECT
          id,
          customer_id,
          customer_name,
          customer_email,
          zip_code,
          service_category,
          service_needed,
          problem_description,
          preferred_date,
          preferred_time,
          budget,
          vehicle_source,
          saved_vehicle_id,
          vehicle_make,
          vehicle_model,
          vehicle_year,
          vehicle_color,
          vehicle_license_plate,
          vehicle_vin,
          vehicle_mileage,
          status,
          created_at
         FROM customer_requests
         WHERE customer_email = ?
         ORDER BY created_at DESC`,
        [email]
      );
      rows = result;
    }

    return res.status(200).json({
      success: true,
      requests: rows
    });
  } catch (error) {
    console.error("Get my requests error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load requests."
    });
  }
});

// ===============================
// BUSINESS: GET REQUESTS FOR BUSINESS ZIP
// ===============================
app.get("/api/business/requests", async (req, res) => {
  try {
    const zip = String(req.query.zip || "").trim();

    if (!zip) {
      return res.status(400).json({
        success: false,
        message: "Business zip is required."
      });
    }

    const [rows] = await db.execute(
      `SELECT
        id,
        customer_id,
        customer_name,
        customer_email,
        zip_code,
        service_category,
        service_needed,
        problem_description,
        preferred_date,
        preferred_time,
        budget,
        vehicle_source,
        saved_vehicle_id,
        vehicle_make,
        vehicle_model,
        vehicle_year,
        vehicle_color,
        vehicle_license_plate,
        vehicle_vin,
        vehicle_mileage,
        status,
        completed_at,
        created_at
       FROM customer_requests
       WHERE zip_code = ?
       ORDER BY created_at DESC`,
      [zip]
    );

    return res.status(200).json({
      success: true,
      requests: rows
    });
  } catch (error) {
    console.error("Get business requests error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load business requests."
    });
  }
});

// ===============================
// BUSINESS: UPDATE REQUEST STATUS
// ===============================
app.put("/api/business/requests/:id/status", async (req, res) => {
  try {
    const requestId = req.params.id;
    const normalizedStatus = normalizeRequestStatus(req.body.status);

    if (!normalizedStatus || !ALLOWED_REQUEST_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status."
      });
    }

    let query = "";
    let values = [];

    if (normalizedStatus === "Accepted") {
      query = `
        UPDATE customer_requests
        SET status = ?,
            accepted_at = NOW()
        WHERE id = ?
      `;
      values = [normalizedStatus, requestId];
    } else if (normalizedStatus === "Work in progress") {
      query = `
        UPDATE customer_requests
        SET status = ?,
            started_at = NOW()
        WHERE id = ?
      `;
      values = [normalizedStatus, requestId];
    } else if (normalizedStatus === "Completed") {
      query = `
        UPDATE customer_requests
        SET status = ?,
            completed_at = NOW()
        WHERE id = ?
      `;
      values = [normalizedStatus, requestId];
    } else if (normalizedStatus === "Declined") {
      query = `
        UPDATE customer_requests
        SET status = ?
        WHERE id = ?
      `;
      values = [normalizedStatus, requestId];
    } else {
      query = `
        UPDATE customer_requests
        SET status = ?
        WHERE id = ?
      `;
      values = [normalizedStatus, requestId];
    }

    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request status updated successfully.",
      status: normalizedStatus
    });
  } catch (error) {
    console.error("Update request status error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update request status."
    });
  }
});

// ===============================
// CUSTOMER: DELETE REQUEST
// ===============================
app.delete("/api/requests/delete-request/:id", async (req, res) => {
  try {
    const requestId = req.params.id;

    const [rows] = await db.execute(
      `SELECT status FROM customer_requests WHERE id = ?`,
      [requestId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Request not found."
      });
    }

    const status = String(rows[0].status || "").trim().toLowerCase();

    if (status === "completed" || status === "done") {
      return res.status(400).json({
        success: false,
        message: "Completed requests cannot be deleted."
      });
    }

    const [result] = await db.execute(
      `DELETE FROM customer_requests WHERE id = ?`,
      [requestId]
    );

    return res.status(200).json({
      success: true,
      message: "Request deleted successfully."
    });
  } catch (error) {
    console.error("Delete request error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete request."
    });
  }
});
// ===============================
// GET BUSINESS REVIEWS BY BUSINESS
// ===============================
app.get("/api/reviews/business/:businessId", async (req, res) => {
  try {
    const businessId = req.params.businessId;

    const [rows] = await db.execute(
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
          business_reply_text,
          business_replied_at,
          business_replied_by,
          created_at
       FROM business_reviews
       WHERE business_id = ?
       ORDER BY created_at DESC`,
      [businessId]
    );

    return res.status(200).json({
      success: true,
      reviews: rows
    });
  } catch (error) {
    console.error("Get business reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch business reviews."
    });
  }
});

// ===============================
// CUSTOMER COUNT
// ===============================
app.get("/api/customers/count", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS total FROM customers"
    );

    return res.status(200).json({
      success: true,
      total: Number(rows[0].total || 0)
    });
  } catch (error) {
    console.error("Customer count error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer count."
    });
  }
});

// ===============================
// SEARCH BUSINESS BY NAME + ZIP (for review page)
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

    const [rows] = await db.execute(
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
// HOMEPAGE SEARCH BUSINESSES
// zip is optional
// ===============================
app.get("/api/search-businesses", async (req, res) => {
  try {
    const keyword = (req.query.keyword || "").trim();
    const zip = (req.query.zip || "").trim();

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Please enter a service to search."
      });
    }

    let sql = `
      SELECT
        id,
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
        zip
      FROM business_users
      WHERE (
        businessName LIKE ?
        OR businessType LIKE ?
        OR services LIKE ?
        OR city LIKE ?
        OR state LIKE ?
      )
    `;

    const searchValue = `%${keyword}%`;
    const params = [
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue
    ];

    if (zip) {
      sql += ` AND zip = ?`;
      params.push(zip);
    }

    sql += ` ORDER BY businessName ASC`;

    const [rows] = await db.execute(sql, params);

    return res.status(200).json({
      success: true,
      businesses: rows
    });
  } catch (error) {
    console.error("SEARCH BUSINESSES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while searching businesses."
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

    const [result] = await db.execute(
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
// BUSINESS: REPLY TO REVIEW
// ===============================
app.put("/api/reviews/business/:reviewId/reply", async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { businessReplyText, businessRepliedBy } = req.body;

    if (!businessReplyText) {
      return res.status(400).json({
        success: false,
        message: "Reply text is required."
      });
    }

    const [result] = await db.execute(
      `UPDATE business_reviews
       SET business_reply_text = ?, business_replied_at = NOW(), business_replied_by = ?
       WHERE id = ?`,
      [businessReplyText, businessRepliedBy || null, reviewId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reply saved successfully."
    });
  } catch (error) {
    console.error("Reply to review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save reply."
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

    const [result] = await db.execute(
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
// CUSTOMER PROFILE
// ===============================
app.get("/api/customers/profile/:id", async (req, res) => {
  try {
    const customerId = req.params.id;

    const [rows] = await db.execute(
      `SELECT id, first_name, last_name, email, phone, zip_code, created_at
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
    console.error("Get customer profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load profile."
    });
  }
});

app.put("/api/customers/profile/:id", async (req, res) => {
  try {
    const customerId = req.params.id;
    const { firstName, lastName, phone, zipCode } = req.body;

    const [result] = await db.execute(
      `UPDATE customers
       SET first_name = ?, last_name = ?, phone = ?, zip_code = ?
       WHERE id = ?`,
      [
        firstName || null,
        lastName || null,
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
    console.error("Update customer profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile."
    });
  }
});

// ===============================
// VEHICLES
// ===============================
app.get("/api/vehicles/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const [rows] = await db.execute(
      `SELECT id, customer_id, make, model, year, color, license_plate, vin, mileage, created_at
       FROM vehicles
       WHERE customer_id = ?
       ORDER BY created_at DESC`,
      [customerId]
    );

    return res.status(200).json({
      success: true,
      vehicles: rows
    });
  } catch (error) {
    console.error("Load vehicles error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load vehicles."
    });
  }
});

app.post("/api/vehicles", async (req, res) => {
  try {
    const {
      customerId,
      make,
      model,
      year,
      color,
      licensePlate,
      vin,
      mileage
    } = req.body;

    if (!customerId || !make || !model) {
      return res.status(400).json({
        success: false,
        message: "Customer, make, and model are required."
      });
    }

    const [result] = await db.execute(
      `INSERT INTO vehicles
       (customer_id, make, model, year, color, license_plate, vin, mileage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        make,
        model,
        year || null,
        color || null,
        licensePlate || null,
        vin || null,
        mileage || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Vehicle added successfully.",
      vehicleId: result.insertId
    });
  } catch (error) {
    console.error("Add vehicle error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add vehicle."
    });
  }
});

app.put("/api/vehicles/:vehicleId", async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const {
      customerId,
      make,
      model,
      year,
      color,
      licensePlate,
      vin,
      mileage
    } = req.body;

    const [result] = await db.execute(
      `UPDATE vehicles
       SET customer_id = ?, make = ?, model = ?, year = ?, color = ?, license_plate = ?, vin = ?, mileage = ?
       WHERE id = ?`,
      [
        customerId,
        make || null,
        model || null,
        year || null,
        color || null,
        licensePlate || null,
        vin || null,
        mileage || null,
        vehicleId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully."
    });
  } catch (error) {
    console.error("Update vehicle error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle."
    });
  }
});

app.delete("/api/vehicles/:vehicleId", async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;

    const [result] = await db.execute(
      `DELETE FROM vehicles WHERE id = ?`,
      [vehicleId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully."
    });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete vehicle."
    });
  }
});

// ===============================
// SAVED BUSINESSES
// ===============================
app.get("/api/saved-businesses/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required."
      });
    }

    const [rows] = await db.execute(
      `SELECT
          sb.id AS saved_id,
          sb.customer_id,
          sb.business_id,
          sb.created_at AS saved_at,
          b.id,
          b.businessName,
          b.ownerName,
          b.businessType,
          b.email,
          b.phone,
          b.website,
          b.services,
          b.addressLine1,
          b.addressLine2,
          b.city,
          b.state,
          b.zip
       FROM saved_businesses sb
       INNER JOIN business_users b
         ON sb.business_id = b.id
       WHERE sb.customer_id = ?
       ORDER BY sb.created_at DESC`,
      [customerId]
    );

    return res.status(200).json({
      success: true,
      businesses: rows
    });
  } catch (error) {
    console.error("Load saved businesses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load saved businesses."
    });
  }
});

// Supports homepage JS that sends JSON body
app.post("/api/save-business", async (req, res) => {
  try {
    const { customer_id, business_id } = req.body;

    if (!customer_id || !business_id) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and Business ID are required."
      });
    }

    const [existing] = await db.execute(
      `SELECT id
       FROM saved_businesses
       WHERE customer_id = ? AND business_id = ?`,
      [customer_id, business_id]
    );

    if (existing.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Business already saved."
      });
    }

    await db.execute(
      `INSERT INTO saved_businesses (customer_id, business_id)
       VALUES (?, ?)`,
      [customer_id, business_id]
    );

    return res.status(201).json({
      success: true,
      message: "Business saved successfully."
    });
  } catch (error) {
    console.error("Save business error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save business."
    });
  }
});

// Keeps compatibility with any older frontend still using params
app.post("/api/save-business/:customerId/:businessId", async (req, res) => {
  try {
    const { customerId, businessId } = req.params;

    const [existing] = await db.execute(
      `SELECT id
       FROM saved_businesses
       WHERE customer_id = ? AND business_id = ?`,
      [customerId, businessId]
    );

    if (existing.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Business already saved."
      });
    }

    await db.execute(
      `INSERT INTO saved_businesses (customer_id, business_id)
       VALUES (?, ?)`,
      [customerId, businessId]
    );

    return res.status(201).json({
      success: true,
      message: "Business saved successfully."
    });
  } catch (error) {
    console.error("Save business error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save business."
    });
  }
});

app.delete("/api/save-business/:customerId/:businessId", async (req, res) => {
  try {
    const { customerId, businessId } = req.params;

    const [result] = await db.execute(
      `DELETE FROM saved_businesses
       WHERE customer_id = ? AND business_id = ?`,
      [customerId, businessId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Saved business not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business removed successfully."
    });
  } catch (error) {
    console.error("Remove saved business error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove saved business."
    });
  }
});

// ===============================
// SEND MESSAGE TO BUSINESS
// ===============================
app.post("/api/messages/send", async (req, res) => {
  try {
    const { customerId, businessId, fromEmail, subject, message } = req.body;

    if (!customerId || !businessId || !fromEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All message fields are required."
      });
    }

    const [customerRows] = await db.execute(
      `SELECT first_name, last_name, email
       FROM customers
       WHERE id = ?
       LIMIT 1`,
      [customerId]
    );

    const [businessRows] = await db.execute(
      `SELECT businessName, email
       FROM business_users
       WHERE id = ?
       LIMIT 1`,
      [businessId]
    );

    if (customerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    if (businessRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business not found."
      });
    }

    await db.execute(
      `INSERT INTO customer_business_messages
       (customer_id, business_id, from_email, to_email, subject, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        businessId,
        fromEmail,
        businessRows[0].email,
        subject,
        message
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Message sent successfully."
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message."
    });
  }
});

// ===============================
// CUSTOMER: GET MY BUSINESS REVIEWS
// ===============================
app.get("/api/reviews/business/customer/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const [rows] = await db.execute(
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
        business_reply_text,
        business_replied_at,
        business_replied_by,
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
      message: "Failed to load business reviews."
    });
  }
});

// ===============================
// CUSTOMER: GET MY APP REVIEWS
// ===============================
app.get("/api/reviews/app/customer/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const [rows] = await db.execute(
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
      message: "Failed to load app reviews."
    });
  }
});
// ===============================
// CONTACT FORM
// ===============================
app.post("/api/contact", async (req, res) => {
  try {
    const { fullName, email, topic, message } = req.body;

    if (!fullName || !email || !topic || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields."
      });
    }

    const [result] = await db.execute(
      `INSERT INTO contact_messages (full_name, email, topic, message)
       VALUES (?, ?, ?, ?)`,
      [fullName, email, topic, message]
    );

    return res.status(201).json({
      success: true,
      message: "Contact message sent successfully.",
      messageId: result.insertId
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send contact message."
    });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { userType, email, newPassword } = req.body;

    if (!userType || !email || !newPassword) {
      return res.status(400).json({
        message: "User type, email, and new password are required."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long."
      });
    }

    let tableName = "";
    let passwordColumn = "";

    if (userType === "customer") {
      tableName = "customers";
      passwordColumn = "password_hash";
    } else if (userType === "business") {
      tableName = "business_users";
      passwordColumn = "passwordHash";
    } else {
      return res.status(400).json({
        message: "Invalid user type."
      });
    }

    const [existingUsers] = await db.execute(
      `SELECT id FROM ${tableName} WHERE email = ? LIMIT 1`,
      [email]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        message: "No account found with that email."
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute(
      `UPDATE ${tableName} SET ${passwordColumn} = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    return res.status(200).json({
      message: "Password reset successful."
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Server error while resetting password."
    });
  }
});

// ===============================
// BUSINESS: REPLY TO REVIEW
// ===============================
app.post("/api/reviews/:reviewId/reply", async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    const { businessId, replyText, repliedBy } = req.body;

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid review ID is required."
      });
    }

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required."
      });
    }

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply text is required."
      });
    }

    const cleanReply = replyText.trim();

    const [reviewRows] = await db.execute(
      `SELECT id, business_id
       FROM business_reviews
       WHERE id = ? AND business_id = ?
       LIMIT 1`,
      [reviewId, businessId]
    );

    if (reviewRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found for this business."
      });
    }

    await db.execute(
      `UPDATE business_reviews
       SET business_reply_text = ?,
           business_replied_at = NOW(),
           business_replied_by = ?
       WHERE id = ? AND business_id = ?`,
      [
        cleanReply,
        repliedBy || "Business Owner",
        reviewId,
        businessId
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Reply posted successfully."
    });
  } catch (error) {
    console.error("POST REVIEW REPLY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while posting reply."
    });
  }
});

// =============================
// BUSINESS PROFILE - GET
// =============================
app.get("/api/business/profile/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        id,
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
        zip
      FROM business_users
      WHERE id = ?
      LIMIT 1
      `,
      [businessId]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Business profile not found."
      });
    }

    return res.status(200).json({
      business: rows[0]
    });
  } catch (error) {
    console.error("GET BUSINESS PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Server error while loading business profile."
    });
  }
});

// =============================
// BUSINESS PROFILE - UPDATE
// =============================
app.put("/api/business/profile/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

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
      zip
    } = req.body;

    if (
      !businessName ||
      !ownerName ||
      !businessType ||
      !email ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !zip
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields."
      });
    }

    const [emailCheck] = await db.query(
      `
      SELECT id
      FROM business_users
      WHERE email = ? AND id <> ?
      LIMIT 1
      `,
      [email, businessId]
    );

    if (emailCheck.length > 0) {
      return res.status(409).json({
        message: "That email is already being used by another business account."
      });
    }

    await db.query(
      `
      UPDATE business_users
      SET
        businessName = ?,
        ownerName = ?,
        businessType = ?,
        email = ?,
        phone = ?,
        website = ?,
        services = ?,
        addressLine1 = ?,
        addressLine2 = ?,
        city = ?,
        state = ?,
        zip = ?
      WHERE id = ?
      `,
      [
        businessName,
        ownerName,
        businessType,
        email,
        phone,
        website || null,
        services || null,
        addressLine1,
        addressLine2 || null,
        city,
        state,
        zip,
        businessId
      ]
    );

    const [updatedRows] = await db.query(
      `
      SELECT
        id,
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
        zip
      FROM business_users
      WHERE id = ?
      LIMIT 1
      `,
      [businessId]
    );

    return res.status(200).json({
      message: "Business profile updated successfully.",
      business: updatedRows[0]
    });
  } catch (error) {
    console.error("UPDATE BUSINESS PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Server error while updating business profile."
    });
  }
});

app.get("/api/home-testimonials", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        customer_name,
        overall_rating,
        service_used,
        zip_code,
        review_text,
        created_at
      FROM app_reviews
      WHERE overall_rating = 5
      ORDER BY created_at DESC
      LIMIT 8
    `);

    res.json({
      success: true,
      testimonials: rows
    });
  } catch (error) {
    console.error("HOME TESTIMONIALS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load testimonials."
    });
  }
});
// ===============================
// BUSINESS INTEREST FORM SUBMIT
// ===============================
app.post("/api/business-interest", async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      email,
      phone,
      serviceType,
      city,
      message
    } = req.body;

    if (
      !businessName ||
      !ownerName ||
      !email ||
      !phone ||
      !serviceType ||
      !city ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    const [result] = await db.execute(
      `INSERT INTO business_interest_forms
      (business_name, owner_name, email, phone, service_type, city, message)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [businessName, ownerName, email, phone, serviceType, city, message]
    );

    return res.status(201).json({
      success: true,
      message: "Business interest form submitted successfully.",
      id: result.insertId
    });
  } catch (error) {
    console.error("Business interest submit error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit business interest form."
    });
  }
});
// ===============================
// HELP CENTER: SUBMIT SUPPORT REQUEST
// ===============================
app.post("/api/help-support", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    const [result] = await db.execute(
      `INSERT INTO help_support_requests (name, email, message)
       VALUES (?, ?, ?)`,
      [name.trim(), email.trim(), message.trim()]
    );

    return res.status(201).json({
      success: true,
      message: "Support request submitted successfully.",
      id: result.insertId
    });
  } catch (error) {
    console.error("Help support submit error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit support request."
    });
  }
});
// ===============================
// START SERVER
// ===============================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});