

/*

    app-track-backend/src/routes/companies.js
    CRUD routes for company entries

    company DB table columns:

    int id | int user_id | varchar name | varchar website | notes txt | timestamp with time zone created_at
*/
import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

//create
//required DB columns: id, uid, name
router.post('/', requireAuth, async (req, res) => {
    const {id, userId, name, website, txt} = req.body;

    if(!id || !userId || !name)
    {
        return res.status(400).json({error: "Company ID, User ID and Company Name are reqired."});
    }

    try{
        const result = await pool.query(`INSERT INTO companies 
                                        (id, user_id, name, website, txt, created_at)
                                        VALUES
                                        ($1, $2, $3, $4, $5, $6)`,
                                         [id, userId, name, website, txt]);
        
    }
    catch (err) {
        console.err(err);
        return res.status(500).json({error: "Failed to create company entry."});
    }
    res.status(201).json(result.rows[0]);
});

//read individual
router.get('/:uid/:id', requireAuth, async (req, res) => {
    //retrieve individual company entry
    //need user id, company id
    const {uid, id} = req.params;

    if(!uid || !id)
    {
        return res.status(400).json({error: "User and Company ID are required."});
    }

    try{
        const result = await pool.query(`SELECT * FROM companies WHERE user_id = $1 AND id = $2`, 
            [uid, id]
        );
        
    }
    catch (err) {
        console.err(err);
        return res.status(500).json({error: "Failed to retrieve company entry."});
    }
    res.status(201).json(result.rows[0]);
});

//read all
router.get('/:uid', requireAuth, async (req, res) => {
    //retrieve individual company entry
    //need user id
    const {uid} = req.params;

    if(!uid)
    {
        return res.status(400).json({error: "User ID is required."});
    }

    try{

        const result = await pool.query(`SELECT id, name, notes FROM companies WHERE user_id = $1`, 
            [uid]
        );
        
    }
    catch (err) {
        console.err(err);
        return res.status(500).json({error: "Failed to retrieve company entries."});
    }
    res.status(201).json(result.rows);
});

//update
router.patch('/', requireAuth, async (req, res) => {
    const {id, uid, name, website, notes} = req.body;

    if(!id || !uid)
    {
        return res.status(400).json({error: "User and Company ID are required."});
    }

    try {

        const result = await pool.query(
            `UPDATE companies
            SET name = COALESCE($1, name), 
                website = COALESCE($2, website),
                notes = COALESCE($3, notes)
            WHERE id = $4 AND user_id = $5
            RETURNING *`,
            [name, website, notes, id, uid]
        );

    } catch (err) {
        return res.status(500).json({error: "Failed to retrieve company entries."});
    }
    res.status(201).json(result.rows[0]);
});


//delete
router.delete('/:id/:uid', requireAuth, async (req, res) => {
    const {id, uid} = req.params;

    if(!id || !uid)
    {
        return res.status(400).json({error: "User and Company ID are required."});   
    }

    try {

        const result = await pool.query(`DELETE FROM companies WHERE id = $1 AND user_id = $2`,
            [id, uid]
        );

    } catch (err) {

        return res.status(500).json({error: "Failed to delete company entry."});
    }
});

export default router;