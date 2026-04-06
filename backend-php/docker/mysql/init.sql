-- BoothieCall Elegancia - Docker MySQL Initialization Script

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS boothiecall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user and grant privileges
CREATE USER IF NOT EXISTS 'boothiecall'@'%' IDENTIFIED BY 'boothiecall_password';
GRANT ALL PRIVILEGES ON boothiecall.* TO 'boothiecall'@'%';
FLUSH PRIVILEGES;

-- Use the database
USE boothiecall;

-- Source the main schema file
-- Note: The main schema.sql will be loaded separately via volume mount