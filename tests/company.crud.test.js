/*

    companies CRUD testing

*/


import request from 'supertest';
import app from '../src/app.js';
import { resetDb } from './helpers/resetDb.js';
import { pool } from '../src/db.js';
import { login } from './helpers/login.js';

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await pool.end(); // closes the connection pool so Jest can exit cleanly
});


describe('POST /api/companies (create)', () => {
    test('Company entry is created successfully', async () => {
        const login_result = await login();

        const res = await request(app)
        .post('/api/companies')
        .set('authorization', `Bearer ${login_result.body.token}`)
        .send({ userId: "1", name: "Graceland"});
        // console.log(`Login Token: ${login_result.body}`);
        // console.log(`Request status: ${res.body.error}`);
        
        expect(res.status).toBe(201);
    });
    
    test('Company entry cannot be made without token', async () => {
        // const login_result = await login();

        const res = await request(app)
        .post('/api/companies')
        .send({ userId: "1", name: "Graceland"});
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Authentication failed.");
    });
});

describe('GET /api/companies (read individual)', () => {
    test('Company entry is read successfully', async () => {
        const login_result = await login();

        const res = await request(app)
        .get('/api/companies/1/1')
        .set('authorization', `Bearer ${login_result.body.token}`);


        expect(res.status).toBe(201);
    });

    test('Company entries are not read without login token', async () => {
        // const login_result = await login();

        const res = await request(app)
        .get('/api/companies/1/1');
        // .set('authorization', `Bearer ${login_result.body.token}`);


        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Authentication failed.");
    });
});


describe('GET /api/companies (read all)', () => {
    test('Company entries are read successfully', async () => {
        const login_result = await login();

        const res = await request(app)
        .get('/api/companies/1')
        .set('authorization', `Bearer ${login_result.body.token}`);


        expect(res.status).toBe(201);
    });

    test('Company entries are not read without login token', async () => {
        // const login_result = await login();

        const res = await request(app)
        .get('/api/companies/1');
        // .set('authorization', `Bearer ${login_result.body.token}`);


        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Authentication failed.");
    });
});

describe('PATCH /api/companies (update)', () => {
    test('Company entry is updated successfully', async () => {
        const login_result = await login();

        const res = await request(app)
        .patch('/api/companies/')
        .set('authorization', `Bearer ${login_result.body.token}`)
        .send({id: "1", uid: "1", name: "Changed", notes: "Can i hab job?"});

        expect(res.status).toBe(201);
    });

    test('Company entry is not changed without login token', async () => {
        // const login_result = await login();

        const res = await request(app)
        .patch('/api/companies')
        // .set('authorization', `Bearer ${login_result.body.token}`);
        .send({id: "1", uid: "1", name: "Changed", notes: "Can i hab job?"});

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Authentication failed.");
    });
});

describe('DELETE /api/companies (delete)', () => {
    test('Company entry is deleted successfully', async () => {
        const login_result = await login();

        const res = await request(app)
        .delete('/api/companies/1/1')
        .set('authorization', `Bearer ${login_result.body.token}`);
        
        expect(res.body.deleted).toBe('1');
        expect(res.status).toBe(200);
    });

    test('Company entry is not deleted without login token', async () => {
        // const login_result = await login();

        const res = await request(app)
        .delete('/api/companies/1/1');
        // .set('authorization', `Bearer ${login_result.body.token}`);
        

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Authentication failed.");
    });

    test('Company entry is not deleted with incorrect uid', async () => {
        const login_result = await login();

        const res = await request(app)
        .delete('/api/companies/1/2')
        .set('authorization', `Bearer ${login_result.body.token}`);

        expect(res.body.deleted).toBe('0');
        expect(res.status).toBe(200);
    });

    test('Company entry is not deleted without uid', async () => {
        const login_result = await login();

        const res = await request(app)
        .delete('/api/companies/1')
        .set('authorization', `Bearer ${login_result.body.token}`);
        //Error will be 404 because the http request and route combo do not match an existing combination
        // ie delete /api/companies/id/uid <-- missing uid in this test
        expect(res.status).toBe(404);
        
    });
});