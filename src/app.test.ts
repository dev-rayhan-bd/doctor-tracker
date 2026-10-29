import request from 'supertest';
import app from './app';

describe('App Endpoints', () => {
  it('GET / - should return 200 and a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Welcome to Doctor Tracker Platform API');
  });

  it('GET /health - should return 200 and health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Doctor Tracker Platform API is healthy');
    expect(res.body.data).toHaveProperty('uptime');
  });

  it('GET /docs - should serve Redocly documentation HTML', async () => {
    const res = await request(app).get('/docs');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<redoc');
    expect(res.text).toContain('redoc.standalone.js');
  });

  it('GET /docs/ - should also serve Redocly documentation HTML', async () => {
    const res = await request(app).get('/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<redoc');
  });

  it('GET /docs/swagger.json - should return OpenAPI spec', async () => {
    const res = await request(app).get('/docs/swagger.json');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('openapi');
    expect(res.body.info.title).toBe('Doctor Tracker Portal API');
  });

  it('GET /api/v1/invalid-route - should return 404', async () => {
    const res = await request(app).get('/api/v1/invalid-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
