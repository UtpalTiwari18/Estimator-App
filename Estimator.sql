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