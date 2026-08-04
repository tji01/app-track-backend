/*
 * Auth.js
 *
 *
 */

import express from 'express';
import bcrypt from 'bcrypt';
import {pool} from '../db.js';
import jwt from 'jsonwebtoken';


const router = express.Router();

router.post('/signup', async (req, res) => {
	const {email, pass, name} = req.body;

	//check for email and password
	if(!email || !pass || !name) 
	{
		return res.status(400).json({error: "Email, Username and Password are Required"});
	}
	
	//check to see if email is in use
	const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
	if(existing.rows.length > 0)
	{
		return res.status(409).json({error: "Email already in use"});
	}

	//generate a password hash
	const passwordHash = await bcrypt.hash(pass, 10)//10 salt rounds
	
	//insert user info to database
	const result = await pool.query('INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name', [email, passwordHash, name]);

	res.status(201).json({user: result.rows[0]});

});


router.post('/login', async (req, res) => {
	
	const {email, pass} = req.body;

	const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
	const user = result.rows[0];

	if(!user)
	{
		return res.status(401).json({error: "Invalid email or password"});
	}
	

	const validPass = await bcrypt.compare(pass, user.password_hash);
	if(!validPass)
	{
		return res.status(401).json({error: "Invalid email or password"});
	}

	const token = jwt.sign(
		{userId: user.id, email: user.email},
		process.env.JWT_SECRET,
		{expiresIn: '100d'}
	);

	res.json({token, user: {id: user.id, email: user.email, name: user.name}});

	
});

export default router;





