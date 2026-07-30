
/*
 *
 * Job Application Tracker - express.js server
 *
 *
 * Tyler Iverson
 * 30 July 2026
 */

const express = require('express');
const db = require('./db');

require('dotenv').config();
const app = express();

PORT = process.env.PORT || 3000;
app.use(express.json());

app.get('/', (req, res) => {
	res.status(200).json({
		success: true,
		message: "Server is up"
	});
	console.log("Health checked by client");
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});


