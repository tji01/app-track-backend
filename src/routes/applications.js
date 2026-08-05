/*
    Applications.js

    CRUD for job application entries

    database columns:
    int id | int user_id | int company_id | varchar role_title | varchar job_post_url | varchar source
    varchar salary_range | varchar current_status | date applied_date | timestamp with timezone created_at
    timestamp with timezone updated_at
*/
import express from 'express';
import { pool } from '../db.js'; 
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

//create
router.post('/', requireAuth, async (req, res) => {
  const { userId, companyId, roleTitle, jobPostUrl, source, salaryRange, appliedDate } = req.body;

  // 1. Validate required fields up front
  if (!companyId || !roleTitle || !appliedDate || !userId) {
    return res.status(400).json({
      error: 'companyId, roleTitle, and appliedDate are required'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 2. Confirm the company exists AND belongs to this user
    //    (prevents attaching an application to someone else's company)
    const company = await client.query(
      'SELECT id FROM companies WHERE id = $1 AND user_id = $2',
      [companyId, req.userId]
    );

    if (company.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Company not found' });
    }

    // 3. Insert the application
    const appResult = await client.query(
      `INSERT INTO applications
         (user_id, company_id, role_title, job_post_url, source, salary_range, applied_date, current_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'applied')
       RETURNING *`,
      [req.userId, companyId, roleTitle, jobPostUrl, source, salaryRange, appliedDate]
    );

    const newApplication = appResult.rows[0];

    // 4. Log the initial stage event
    await client.query(
      'INSERT INTO stage_events (application_id, stage) VALUES ($1, $2)',
      [newApplication.id, 'applied']
    );

    await client.query('COMMIT');
    res.status(201).json(newApplication);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create application' });
  } finally {
    client.release();
  }
});

//read
/*
    retrieve all applications associated with user id, along with associated stage events and notes
*/
router.get('/read-app', requireAuth, async (req, res) => {
    const {id, uid} = req.body;

    if(!id || !uid)
    {
        return res.status(400).json({error: "Application ID and User ID are required"});
    }

    const applications = await pool.query("SELECT * FROM applications WHERE id = $1 AND user_id = $2", [id, uid]);

    if(applications.rows.length == 0)
    {
        return res.status(404).json({error: "Application not found"});
    }

    const stage = await pool.query("SELECT * FROM stage_events WHERE application_id = $1 ORDER BY occurred_at ASC",
        [id]
    )
    const notes = await pool.query("SELECT * FROM notes WHERE application_id = $1 ORDER BY created_at DESC",
        [id]
    )
    res.status(201).json({applications: applications.rows, stage: stage.rows, notes: notes.rows});
});



//update
router.patch('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { roleTitle, jobPostUrl, source, salaryRange, currentStatus, appliedDate } = req.body;

  const client = await pool.connect();


  //wrap in transaction so the application stage event history does not get unsynchronized on server fail
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    
    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Application not found' });
    }

    const statusChanged = currentStatus && currentStatus !== existing.rows[0].current_status;

    const updated = await client.query(
      `UPDATE applications
       SET role_title = COALESCE($1, role_title),
           job_post_url = COALESCE($2, job_post_url),
           source = COALESCE($3, source),
           salary_range = COALESCE($4, salary_range),
           current_status = COALESCE($5, current_status),
           applied_date = COALESCE($6, applied_date),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [roleTitle, jobPostUrl, source, salaryRange, currentStatus, appliedDate, id, req.userId]
    );

    if (statusChanged) {
      await client.query(
        'INSERT INTO stage_events (application_id, stage) VALUES ($1, $2)',
        [id, currentStatus]
      );
    }

    await client.query('COMMIT');
    res.json(updated.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update application' });
  } finally {
    client.release();
  }
});



//delete


router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, req.userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Application not found' });
  }

  res.status(204).send();
});

export default router;