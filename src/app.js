import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
//import companyRoutes from './routes/companies.js';
import applicationRoutes from './routes/applications.js';
//import stageEventRoutes from './routes/stageEvents.js';
//import contactRoutes from './routes/contacts.js';
//import noteRoutes from './routes/notes.js';

const app = express();

// --- global middleware ---
app.use(cors());              // allows React frontend (different origin) to call this API; this will need to be fixed later to restrict access to just the frontend.
app.use(express.json());      // parses JSON request bodies into req.body

// --- routes ---
app.use('/api/auth', authRoutes);
//app.use('/api/companies', companyRoutes);
app.use('/api/applications', applicationRoutes);
//app.use('/api/stage-events', stageEventRoutes);
//app.use('/api/contacts', contactRoutes);
//app.use('/api/notes', noteRoutes);

// --- health check (useful for confirming deploy worked) ---
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// --- 404 handler (no route matched) ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- centralized error handler (catches thrown/next(err) errors) ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;
