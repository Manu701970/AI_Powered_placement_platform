CREATE DATABASE IF NOT EXISTS pathfinder
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'pathfinder_app'@'localhost'
  IDENTIFIED BY 'replace-with-a-local-password';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX
  ON pathfinder.*
  TO 'pathfinder_app'@'localhost';

FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS pathfinder.student_account (
  usn VARCHAR(36) NOT NULL PRIMARY KEY
);
