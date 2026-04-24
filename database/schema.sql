-- PokéGrade Database Schema

CREATE DATABASE IF NOT EXISTS pokegrade;
USE pokegrade;

CREATE TABLE IF NOT EXISTS cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cert_number VARCHAR(20) UNIQUE,
  card_name VARCHAR(255) NOT NULL,
  card_set VARCHAR(100),
  card_number VARCHAR(20),
  psa9_price DECIMAL(10,2),
  psa10_price DECIMAL(10,2),
  image_url TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS regrade_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT,
  centering_score DECIMAL(4,2),
  corners_score DECIMAL(4,2),
  edges_score DECIMAL(4,2),
  surface_score DECIMAL(4,2),
  estimated_grade DECIMAL(3,1),
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id)
);

ALTER TABLE cards
ADD COLUMN current_grade VARCHAR(32) NULL AFTER card_number;