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

select * from customers;

CREATE TABLE business_users (
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

select * from business_users;
