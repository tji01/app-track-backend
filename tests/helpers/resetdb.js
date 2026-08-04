

import { pool } from '../../src/db.js';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedSql = fs.readFileSync(
  path.resolve(__dirname, '../../documentation/db_schema/seed.sql'),
  'utf-8'
);

export async function resetDb() {
  await pool.query(
    'TRUNCATE users, companies, applications, stage_events, contacts, notes RESTART IDENTITY CASCADE'
  );
  await pool.query(seedSql);
}