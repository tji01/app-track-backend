/*
 * Database connection file
 */


import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a new pool instance using environment variables

console.log("Initializing database connection...");

export const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.query("SELECT 1")
	.then(()=>console.log("Database Connected Successfully"))
	.catch((err) => {
		console.error("Database Connection Failed:", err.message);
		process.exit(1);
	});

// Helper function to handle queries safely
//module.exports = {
//  query: (text, params) => pool.query(text, params),
//};


