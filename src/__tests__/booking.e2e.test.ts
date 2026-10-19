import request from 'supertest';
import app from '../app';
import pool from '../config/db';
const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

async function registerAndLogin(emailPrefix: string) {
    const email = `${emailPrefix}-${unique()}@test.com`;
    const res = await request(app)
    .post('/api/auth/register')
    .send({ name: emailPrefix, email, password: 'password123' });
    if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
    return { token: res.body.accessToken, userId: res.body.user.id, email };
}

async function createAdminToken() {
    const { email } = await registerAndLogin('admin');
    await pool.query(`UPDATE users SET role = 'ADMIN' WHERE email = $1`, [email]);
    // the role is baked into the JWT, so log in again to get an ADMIN token
    const login = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    return login.body.accessToken as string;
}

describe('booking flow (end to end)', () => {
    let resourceId: number;

    beforeAll(async () => {
        const adminToken = await createAdminToken();
        const resourceRes = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: `Room ${unique()}`, capacity: 2 });
        expect(resourceRes.status).toBe(201);
        resourceId = resourceRes.body.id;
    });

    afterAll(async () => {
        await pool.end();
    });

    it('rejects an unauthenticated booking attempt', async () => {
        const res = await request(app).post('/api/bookings').send({
        resource_id: resourceId,
        start_time: '2028-01-01T10:00:00Z',
        end_time: '2028-01-01T11:00:00Z',
        });
        expect(res.status).toBe(401);
    });

    it('creates a booking, then rejects an overlapping one with 409', async () => {
        const { token } = await registerAndLogin('usera');
 
        const first = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({ resource_id: resourceId, start_time: '2028-02-01T10:00:00Z', end_time: '2028-02-01T11:00:00Z' });
        expect(first.status).toBe(201);

        const overlapping = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({ resource_id: resourceId, start_time: '2028-02-01T10:30:00Z', end_time: '2028-02-01T11:30:00Z' });
        expect(overlapping.status).toBe(409);
    });

    it('hides another user\'s booking as a 404', async () => {
        const { token: ownerToken } = await registerAndLogin('owner');
        const { token: strangerToken } = await registerAndLogin('stranger');
        const created = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ resource_id: resourceId, start_time: '2028-03-01T10:00:00Z', end_time: '2028-03-01T11:00:00Z' });
        const asStranger = await request(app)
        .get(`/api/bookings/${created.body.id}`)
        .set('Authorization', `Bearer ${strangerToken}`);
        expect(asStranger.status).toBe(404);
    });
});