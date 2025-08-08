import { adminRegisterSchema, adminLoginSchema, adminUpdateSchema } from '../../src/validations/admin';

describe('Admin Validation Schemas', () => {
  describe('adminRegisterSchema', () => {
    const validData = {
      fullName: 'John Admin',
      email: 'admin@example.com',
      password: 'Admin123!',
    };

    it('should validate correct data', () => {
      const result = adminRegisterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    describe('fullName validation', () => {
      it('should reject empty fullName', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          fullName: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                message: 'Full name must be at least 2 characters',
              }),
            ])
          );
        }
      });

      it('should reject fullName shorter than 2 characters', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          fullName: 'A',
        });
        expect(result.success).toBe(false);
      });

      it('should reject fullName longer than 100 characters', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          fullName: 'A'.repeat(101),
        });
        expect(result.success).toBe(false);
      });

      it('should reject fullName with numbers', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          fullName: 'John123',
        });
        expect(result.success).toBe(false);
      });

      it('should reject fullName with special characters', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          fullName: 'John@Admin',
        });
        expect(result.success).toBe(false);
      });

      it('should accept fullName with spaces', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          fullName: 'John Doe Admin',
        });
        expect(result.success).toBe(true);
      });
    });

    describe('email validation', () => {
      it('should reject invalid email format', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          email: 'invalid-email',
        });
        expect(result.success).toBe(false);
      });

      it('should reject email shorter than 5 characters', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          email: 'a@b',
        });
        expect(result.success).toBe(false);
      });

      it('should reject email longer than 255 characters', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          email: `a${'b'.repeat(250)}@example.com`,
        });
        expect(result.success).toBe(false);
      });

      it('should accept valid email formats', () => {
        const validEmails = [
          'admin@example.com',
          'admin.test@example.co.uk',
          'admin+test@example.com',
        ];

        validEmails.forEach(email => {
          const result = adminRegisterSchema.safeParse({
            ...validData,
            email,
          });
          expect(result.success).toBe(true);
        });
      });
    });

    describe('password validation', () => {
      it('should reject password shorter than 8 characters', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          password: 'Abc1!',
        });
        expect(result.success).toBe(false);
      });

      it('should reject password longer than 128 characters', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          password: 'A'.repeat(129),
        });
        expect(result.success).toBe(false);
      });

      it('should reject password without uppercase letter', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          password: 'admin123!',
        });
        expect(result.success).toBe(false);
      });

      it('should reject password without lowercase letter', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          password: 'ADMIN123!',
        });
        expect(result.success).toBe(false);
      });

      it('should reject password without number', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          password: 'AdminABC!',
        });
        expect(result.success).toBe(false);
      });

      it('should reject password without special character', () => {
        const result = adminRegisterSchema.safeParse({
          ...validData,
          password: 'Admin123',
        });
        expect(result.success).toBe(false);
      });

      it('should accept valid passwords', () => {
        const validPasswords = [
          'Admin123!',
          'MyPass1@',
          'Secure2#',
          'Complex3$',
          'TestPass4%',
          'Strong5&',
        ];

        validPasswords.forEach(password => {
          const result = adminRegisterSchema.safeParse({
            ...validData,
            password,
          });
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe('adminLoginSchema', () => {
    const validData = {
      email: 'admin@example.com',
      password: 'Admin123!',
    };

    it('should validate correct data', () => {
      const result = adminLoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = adminLoginSchema.safeParse({
        ...validData,
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = adminLoginSchema.safeParse({
        ...validData,
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('adminUpdateSchema', () => {
    it('should validate partial data', () => {
      const result = adminUpdateSchema.safeParse({
        fullName: 'Updated Name',
      });
      expect(result.success).toBe(true);
    });

    it('should validate empty object', () => {
      const result = adminUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid fullName when provided', () => {
      const result = adminUpdateSchema.safeParse({
        fullName: 'A', // Too short
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email when provided', () => {
      const result = adminUpdateSchema.safeParse({
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid boolean isActive', () => {
      const result = adminUpdateSchema.safeParse({
        isActive: false,
      });
      expect(result.success).toBe(true);
    });
  });
}); 