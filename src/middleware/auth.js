/*
 *
 *
 * middleware/auth.js
 *
 * function to protect routes
 */

import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next)
{
	const authHeader = req.headers.authorization;

	if(!authHeader || !authHeader.startsWith('Bearer '))
	{
		return res.status(401).json({error: 'Authentication failed.'});
	}

	const token = authHeader.split(' ')[1];

	try {
		
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.userId;
		next();

	} catch (err) {
		
		return res.status(401).json({error: 'Invalid or Expired Token'});

	}


}
