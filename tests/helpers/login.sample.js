import { pool } from '../../src/db.js';
import app from '../../src/app.js';
import request from 'supertest';

export async function login()
{
    const login_response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'a-valid-user-email', pass: 'the-valid-user-password' });

    return login_response; //token is accessed by accessors `login_response.body.token`
}