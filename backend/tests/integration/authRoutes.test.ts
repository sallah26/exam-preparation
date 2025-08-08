import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src/server';
import { testDb } from '../utils/testDb';

describe('Auth Routes Integration Tests', () => {
  let adminId: string;
  let adminToken: string;

  beforeAll(async () => {
    await testDb.cleanup();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test admin
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      const admin = await testDb.createTestAdmin({
        fullName: 'Test Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        isActive: true,
      });
      adminId = admin.id;
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Admin123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('admin');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('expiresIn');
      expect(response.body.data.admin).toHaveProperty('id', adminId);
      expect(response.body.data.admin).toHaveProperty('fullName', 'Test Admin');
      expect(response.body.data.admin).toHaveProperty('email', 'admin@example.com');
      expect(response.body.data.admin).not.toHaveProperty('password');

      // Store token for other tests
      adminToken = response.body.data.token;
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Admin123!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: '',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation error');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Admin123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should return 401 for deactivated account', async () => {
      // Create a deactivated admin
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      await testDb.createTestAdmin({
        fullName: 'Inactive Admin',
        email: 'inactive@example.com',
        password: hashedPassword,
        isActive: false,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'Admin123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Account is deactivated. Please contact administrator.');
    });

    it('should sanitize email input', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '  ADMIN@EXAMPLE.COM  ',
          password: 'Admin123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.admin).toHaveProperty('email', 'admin@example.com');
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      // Create a test admin and get token
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      const admin = await testDb.createTestAdmin({
        fullName: 'Test Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        isActive: true,
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Admin123!',
        });

      adminToken = loginResponse.body.data.token;
      adminId = admin.id;
    });

    it('should return admin profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Profile retrieved successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('admin');
      expect(response.body.data.admin).toHaveProperty('id', adminId);
      expect(response.body.data.admin).toHaveProperty('fullName', 'Test Admin');
      expect(response.body.data.admin).toHaveProperty('email', 'admin@example.com');
      expect(response.body.data.admin).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Access token is required');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('should return 401 with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Access token is required');
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      // Create a test admin and get token
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      await testDb.createTestAdmin({
        fullName: 'Test Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        isActive: true,
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Admin123!',
        });

      adminToken = loginResponse.body.data.token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Logout successful');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Access token is required');
    });
  });
}); 