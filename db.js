/*
 * Database connection file
 */


const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance using environment variables

console.log("Initializing database connection...");

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Helper function to handle queries safely
module.exports = {
  query: (text, params) => pool.query(text, params),
};

