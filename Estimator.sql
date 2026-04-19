CREATE DATABASE IF NOT EXISTS estimatorDb;
USE estimatorDb;

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),
    zip_code VARCHAR(10),
    password_hash VARCHAR(255),
    terms_accepted TINYINT(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    businessName VARCHAR(150) NOT NULL,
    ownerName VARCHAR(150) NOT NULL,
    businessType VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    website VARCHAR(255),
    services TEXT NOT NULL,
    addressLine1 VARCHAR(255) NOT NULL,
    addressLine2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(20) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(150),
    business_id INT NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    business_zip VARCHAR(10),
    service_used VARCHAR(150) NOT NULL,
    overall_rating INT NOT NULL,
    service_location VARCHAR(255) NOT NULL,
    service_state VARCHAR(50) NOT NULL,
    review_title VARCHAR(255) NOT NULL,
    would_recommend VARCHAR(20) NOT NULL,
    service_date DATE NOT NULL,
    value_for_money INT NOT NULL,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_business_overall_rating CHECK (overall_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_business_value_for_money CHECK (value_for_money BETWEEN 1 AND 5),
    CONSTRAINT fk_business_review_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    CONSTRAINT fk_business_review_business FOREIGN KEY (business_id) REFERENCES business_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(150),
    overall_rating INT NOT NULL,
    service_used VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    ease_of_use INT NOT NULL,
    business_match_quality INT NOT NULL,
    review_title VARCHAR(255) NOT NULL,
    would_recommend VARCHAR(20) NOT NULL,
    improvement_suggestion VARCHAR(255) NOT NULL,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_app_overall_rating CHECK (overall_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_app_ease_of_use CHECK (ease_of_use BETWEEN 1 AND 5),
    CONSTRAINT chk_app_match_quality CHECK (business_match_quality BETWEEN 1 AND 5),
    CONSTRAINT fk_app_review_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  make VARCHAR(100),
  model VARCHAR(100),
  year INT,
  color VARCHAR(50),
  license_plate VARCHAR(50),
  vin VARCHAR(100),
  mileage INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS customer_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(150),
    zip_code VARCHAR(10) NOT NULL,
    service_category VARCHAR(100) NOT NULL,
    service_needed VARCHAR(255) NOT NULL,
    problem_description TEXT NOT NULL,
    preferred_date DATE NULL,
    preferred_time VARCHAR(100) NULL,
    budget VARCHAR(100) NULL,
    vehicle_source VARCHAR(20) NOT NULL,
    saved_vehicle_id INT NULL,
    vehicle_make VARCHAR(100) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_year VARCHAR(20) NULL,
    vehicle_color VARCHAR(50) NULL,
    vehicle_license_plate VARCHAR(50) NULL,
    vehicle_vin VARCHAR(100) NULL,
    vehicle_mileage VARCHAR(50) NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_businesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    business_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_saved_business (customer_id, business_id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES business_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request_custom_vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  customer_id INT NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year VARCHAR(20) NULL,
  color VARCHAR(50) NULL,
  license_plate VARCHAR(50) NULL,
  vin VARCHAR(100) NULL,
  mileage VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_request_custom_vehicle_request
    FOREIGN KEY (request_id) REFERENCES customer_requests(id)
    ON DELETE CASCADE
);

ALTER TABLE request_custom_vehicles
ADD CONSTRAINT fk_request_custom_vehicle_customer
FOREIGN KEY (customer_id) REFERENCES customers(id)
ON DELETE CASCADE;

UPDATE customer_requests
SET status = 'Pending'
WHERE id > 0
  AND (
    status IS NULL
    OR TRIM(status) = ''
    OR LOWER(TRIM(status)) NOT IN (
      'pending',
      'declined',
      'accepted',
      'work in progress',
      'completed'
    )
  );
ALTER TABLE customer_requests
ADD COLUMN completed_at DATETIME NULL;

ALTER TABLE business_reviews
ADD COLUMN business_reply_text TEXT NULL,
ADD COLUMN business_replied_at DATETIME NULL,
ADD COLUMN business_replied_by VARCHAR(150) NULL;

SELECT * FROM customers;
SELECT * FROM business_users;
SELECT * FROM business_reviews;
SELECT * FROM app_reviews;
SELECT * FROM vehicles;
SELECT * FROM customer_requests;
SELECT * FROM saved_businesses;
SELECT * FROM contact_messages;
SELECT * FROM request_custom_vehicles;

SELECT id, review_title, business_reply_text, business_replied_at, business_replied_by
FROM business_reviews
ORDER BY id DESC;
