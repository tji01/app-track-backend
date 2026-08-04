// backend/tests/auth.test.js
import request from 'supertest';
import app from '../src/app.js';
import { resetDb } from './helpers/resetDb.js';
import { pool } from '../src/db.js';

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await pool.end(); // closes the connection pool so Jest can exit cleanly
});

describe('POST /api/auth/signup', () => {
  test('rejects signup without username', async () =>{
    const res = await request(app)
    .post('/api/auth/signup')
    .send({ email: "tylrivrs@gmail.com", pass:"pass" });

    expect(res.status).toBe(400);
  });

  test('rejects signup without password' , async () => {
    const res = await request(app)
    .post('/api/auth/signup')
    .send({email: 'tylrivrs@gmail.com', name:'tyler'});

    expect(res.status).toBe(400);
  });

  test('rejects signup without email', async () => {
    const res = await request(app)
    .post('/api/auth/signup')
    .send({pass:"pass", name:'tyler'});

    expect(res.status).toBe(400);
  });

  test('accept signup with email, password, username defined' , async () => {
    const res = await request(app)
    .post('/api/auth/signup')
    .send({pass:"pass", name:'tyler', email:"tylrivrs@gmail.com"});

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  test('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tyler@example.com', pass: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  test('rejects login with nonexistant email', async () => {
    const res = await request(app)
    .post('/api/auth/login')
    .send({email: 'alex@example.com', pass: 'vetgav-7dovry-nAbkoj'});

    expect(res.status).toBe(401);
  })

  test('logs in successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tyler@example.com', pass: 'vetgav-7dovry-nAbkoj' }); // must match hashed entry in seed.sql in plaintext form

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });


});