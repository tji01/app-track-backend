/*
 *
 *
 * middleware/auth.js
 *
 * function to protect routes
 */

import jwt from 'jsonwebtoken';


/*
	Used to validate a given token belongs to a valid user
*/
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

/*
	Verify that a token belongs to the user ID a request claims to be coming from.
*/
export function verifyCredentials(claim, req)
{
	const authHeader = req.headers.authorization;

	const token = authHeader.split(' ')[1];

	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	var realID = decoded.userId;

	if(realID == claim) return true;

	return false;
}
