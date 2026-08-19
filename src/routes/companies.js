

/*

    app-track-backend/src/routes/companies.js
    CRUD routes for company entries

    company DB table columns:

    int id | int user_id | varchar name | varchar website | txt notes | timestamp with time zone created_at
*/
import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

//create
//required DB columns: id, uid, name
router.post('/', requireAuth, async (req, res) => {
    const {userId, name, website, notes} = req.body;
    var result;

    if(!userId || !name)
    {
        return res.status(400).json({error: "User ID and Company Name are reqired."});
    }

    try{
        result = await pool.query(`INSERT INTO companies 
                                        (user_id, name, website, notes, created_at)
                                        VALUES
                                        ($1, $2, $3, $4, NOW())`,
                                         [userId, name, website, notes]);
        
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({error: "Failed to create company entry."});
    }
    res.status(201).json(result.rows[0]);
});

//read individual
router.get('/:uid/:id', requireAuth, async (req, res) => {
    //retrieve individual company entry
    //need user id, company id
    const {uid, id} = req.params;
    var result;
    if(!uid || !id)
    {
        return res.status(400).json({error: "User and Company ID are required."});
    }

    try{
        result = await pool.query(`SELECT * FROM companies WHERE user_id = $1 AND id = $2`, 
            [uid, id]
        );
        
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({error: "Failed to retrieve company entry."});
    }
    res.status(201).json(result.rows[0]);
});

//read all
router.get('/:uid', requireAuth, async (req, res) => {
    //retrieve individual company entry
    //need user id
    const {uid} = req.params;
    var result;
    if(!uid)
    {
        return res.status(400).json({error: "User ID is required."});
    }

    try{

        result = await pool.query(`SELECT id, name, notes FROM companies WHERE user_id = $1`, 
            [uid]
        );
        
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({error: "Failed to retrieve company entries."});
    }
    res.status(201).json(result.rows);
});

//update
router.patch('/', requireAuth, async (req, res) => {
    const {id, uid, name, website, notes} = req.body;
    var result;
    if(!id || !uid)
    {
        return res.status(400).json({error: "User and Company ID are required."});
    }

    try {

        result = await pool.query(
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
    var result;
    if(!id || !uid)
    {
        return res.status(400).json({error: "User and Company ID are required."});   
    }

    try {

        result = await pool.query(`DELETE FROM companies WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, uid]
        );

    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Failed to delete company entry."});
    }
    
    res.status(200).json({deleted: `${result.rows.length}`});
});

export default router;