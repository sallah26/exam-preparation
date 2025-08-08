import request from 'supertest';
import app from '../../src/server';
import { testDb } from '../utils/testDb';

describe('Admin Routes Integration Tests', () => {
  beforeAll(async () => {
    await testDb.cleanup();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('POST /api/admin/register', () => {
    const validAdminData = {
      fullName: 'John Admin',
      email: 'admin@example.com',
      password: 'Admin123!',
    };

    it('should register a new admin successfully', async () => {
      const response = await request(app)
        .post('/api/admin/register')
        .send(validAdminData)
        .expect(201);

      expect(response.body).toHaveProperty('admin');
      expect(response.body).toHaveProperty('message', 'Admin registered successfully');
      expect(response.body.admin).toHaveProperty('id');
      expect(response.body.admin).toHaveProperty('fullName', 'John Admin');
      expect(response.body.admin).toHaveProperty('email', 'admin@example.com');
      expect(response.body.admin).toHaveProperty('isActive', true);
      expect(response.body.admin).not.toHaveProperty('password');

      // Verify admin was actually created in database
      const adminInDb = await testDb.getAdminByEmail('admin@example.com');
      expect(adminInDb).toBeTruthy();
      expect(adminInDb?.fullName).toBe('John Admin');
      expect(adminInDb?.email).toBe('admin@example.com');
      expect(adminInDb?.password).not.toBe('Admin123!'); // Should be hashed
    });

    it('should return 409 if admin with email already exists', async () => {
      // Create first admin
      await request(app)
        .post('/api/admin/register')
        .send(validAdminData)
        .expect(201);

      // Try to create second admin with same email
      const response = await request(app)
        .post('/api/admin/register')
        .send(validAdminData)
        .expect(409);

      expect(response.body).toEqual({
        error: 'Conflict',
        message: 'Admin with this email already exists',
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/admin/register')
        .send({
          fullName: 'John Admin',
          // missing email and password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
      expect(response.body).toHaveProperty('message', 'Invalid input data');
      expect(response.body).toHaveProperty('details');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/admin/register')
        .send({
          ...validAdminData,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'Invalid email format',
          }),
        ])
      );
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/admin/register')
        .send({
          ...validAdminData,
          password: 'weak',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('Password must contain'),
          }),
        ])
      );
    });

    it('should sanitize input data', async () => {
      const response = await request(app)
        .post('/api/admin/register')
        .send({
          fullName: '  John Admin  ',
          email: '  ADMIN@EXAMPLE.COM  ',
          password: 'Admin123!',
        })
        .expect(201);

      expect(response.body.admin.fullName).toBe('John Admin');
      expect(response.body.admin.email).toBe('admin@example.com');
    });
  });

  describe('GET /api/admin', () => {
    beforeEach(async () => {
      // Create test admins
      await testDb.createTestAdmin({
        fullName: 'Admin One',
        email: 'admin1@example.com',
        password: 'hashed-password',
      });
      await testDb.createTestAdmin({
        fullName: 'Admin Two',
        email: 'admin2@example.com',
        password: 'hashed-password',
      });
    });

    it('should return paginated list of admins', async () => {
      const response = await request(app)
        .get('/api/admin')
        .expect(200);

      expect(response.body).toHaveProperty('admins');
      expect(response.body).toHaveProperty('total', 2);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body.admins).toHaveLength(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/admin?page=1&limit=1')
        .expect(200);

      expect(response.body.admins).toHaveLength(1);
      expect(response.body.total).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/admin?search=One')
        .expect(200);

      expect(response.body.admins).toHaveLength(1);
      expect(response.body.admins[0].fullName).toBe('Admin One');
    });

    it('should filter by isActive status', async () => {
      // Create an inactive admin
      await testDb.createTestAdmin({
        fullName: 'Inactive Admin',
        email: 'inactive@example.com',
        password: 'hashed-password',
        isActive: false,
      });

      const response = await request(app)
        .get('/api/admin?isActive=true')
        .expect(200);

      expect(response.body.admins.every((admin: any) => admin.isActive)).toBe(true);
    });
  });

  describe('GET /api/admin/:id', () => {
    let adminId: string;

    beforeEach(async () => {
      const admin = await testDb.createTestAdmin({
        fullName: 'Test Admin',
        email: 'test@example.com',
        password: 'hashed-password',
      });
      adminId = admin.id;
    });

    it('should return admin by ID', async () => {
      const response = await request(app)
        .get(`/api/admin/${adminId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', adminId);
      expect(response.body).toHaveProperty('fullName', 'Test Admin');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent admin', async () => {
      const response = await request(app)
        .get('/api/admin/non-existent-id')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Not found',
        message: 'Admin not found',
      });
    });
  });
}); 