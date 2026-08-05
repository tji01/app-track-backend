/*

    Application CRUD testing

*/


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

//create test
describe('POST /api/applications', () => {
    test('accepts application creation with JWT token and necessary data', async () => {
        const token = await request(app)
        .post('/api/auth/login')
        .send({ email: 'tyler@example.com', pass: 'vetgav-7dovry-nAbkoj' });

        const res = await request(app)
        .post('/api/applications')
        .set('authorization', `Bearer ${token.body.token}`)
        .send({userId: "1", companyId: "2", roleTitle: "Gamer", appliedDate: "2001-11-16"});
        
        expect(res.status).toBe(201);
    });

    test('rejects application creation without JWT token', async () => {
        const token = await request(app)
        .post('/api/auth/login')
        .send({ email: 'tyler@example.com', pass: 'vetgav-7dovry-nAbkoj' });

        const res = await request(app)
        .post('/api/applications')
        //.set('authorization', `Bearer ${token.body.token}`)
        .send({userId: "1", companyId: "2", roleTitle: "Gamer", appliedDate: Date.now()});

        expect(res.status).toBe(401);
    });

    test('rejects application creation without essential data', async () => {
        //log in first since application routes require valid authentication
        const token = await request(app)
        .post('/api/auth/login')
        .send({ email: 'tyler@example.com', pass: 'vetgav-7dovry-nAbkoj' });

        expect(token.body.token).toBeDefined();

        const res = await request(app)
        .post('/api/applications')
        .set('authorization', `Bearer ${token.body.token}`)
        .send({garbageInput: "is here"});
    });
});