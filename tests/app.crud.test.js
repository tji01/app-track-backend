/*

    Application CRUD testing

*/


import request from 'supertest';
import app from '../src/app.js';
import { resetDb } from './helpers/resetDb.js';
import { pool } from '../src/db.js';
import { login } from './helpers/login.js'

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


describe('GET /api/applications/:uid (read all)', () => {
    test('Successfully reads all applications associated with userId', async () => {
        const token = await login();

        const res = await request(app)
        .get('/api/applications/1')
        .set('authorization', `Bearer ${token.body.token}`);
        

        expect(res.status).toBe(200);
        expect(res.body.applications).toBeDefined();

    });

    test('Rejects request if unauthenticated', async () => {
        //const token = await login();

        const res = await request(app)
        .get('/api/applications/1');
        //.set('authorization', `Bearer ${token.body.token}`);
        
        expect(res.status).toBe(401);
    });

    test('Rejects request if unauthorized access by authenticated user is attempted', async () => {
        const token = await login();

        const res = await request(app)
        .get('/api/applications/2') // <-- UID is someone elses, should not read results
        .set('authorization', `Bearer ${token.body.token}`);
        
        expect(res.status).toBe(401);
    });

    
});

describe('GET /api/applications/:id/:uid (read individual)', () => {
    test('Successfully reads single requested application', async () => {
        const token = await login();

        const res = await request(app)
        .get('/api/applications/1/1')
        .set('authorization', `Bearer ${token.body.token}`);

        expect(res.status).toBe(200);
        expect(res.body.applications).toBeDefined();
        expect(res.body.stage).toBeDefined();
        expect(res.body.notes).toBeDefined();
    });

    test('Rejects request if unauthenticated', async () => {
        //const token = await login();

        const res = await request(app)
        .get('/api/applications/1/1');
        //.set('authorization', `Bearer ${token.body.token}`);
        
        expect(res.status).toBe(401);
    });

    test('Rejects request if unauthorized access by authenticated user is attempted', async () => {
        const token = await login();

        const res = await request(app)
        .get('/api/applications/1/2') // <-- UID is someone elses, should not read results
        .set('authorization', `Bearer ${token.body.token}`);
        
        expect(res.status).toBe(401);
    });
});

describe('PATCH /api/applications/:id (update)', () => {
    test('Successfully updates application', async () => {
        const token = await login();

        const res = await request(app)
        .patch('/api/applications/1')
        .set('authorization', `Bearer ${token.body.token}`)
        .send({roleTitle: 'Alpha', salaryRange: '1B', currentStatus: 'offer' });

        
        expect(res.status).toBe(200);
        // console.log(res.body);

    });

    test('Rejects application update if unauthenticated', async () => {
        // const token = await login();


        const res = await request(app)
        .patch('/api/applications/1')
        // .set('authorization', `Bearer ${token.body.token}`)
        .send({roleTitle: 'Alpha', salaryRange: '1B', currentStatus: 'offer' });

        expect(res.status).toBe(401);
    });
});

describe('DELETE /api/applications/:id', () => {
    test('Successfully deletes application', async () => {
        const token = await login();

        const res = await request(app)
        .delete('/api/applications/1')
        .set('authorization', `Bearer ${token.body.token}`);

        expect(res.status).toBe(204);


    });

    test('Rejects delete request if unauthenticated', async () => {
        // const token = await login();

        const res = await request(app)
        .delete('/api/applications/1');
        // .set('authorization', `Bearer ${token.body.token}`)

        expect(res.status).toBe(401);
    });
});