import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const testDb = {
  /**
   * Clean up all test data
   */
  async cleanup() {
    try {
      await prisma.admin.deleteMany();
      await prisma.user.deleteMany();
    } catch (error) {
      console.error('Error cleaning up test database:', error);
    }
  },

  /**
   * Create a test admin
   */
  async createTestAdmin(data: {
    fullName: string;
    email: string;
    password: string;
    isActive?: boolean;
  }) {
    return await prisma.admin.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: data.password, // Note: In real tests, this should be hashed
        isActive: data.isActive ?? true,
      },
    });
  },

  /**
   * Get admin by email
   */
  async getAdminByEmail(email: string) {
    return await prisma.admin.findUnique({
      where: { email },
    });
  },

  /**
   * Get admin by ID
   */
  async getAdminById(id: string) {
    return await prisma.admin.findUnique({
      where: { id },
    });
  },

  /**
   * Count total admins
   */
  async countAdmins() {
    return await prisma.admin.count();
  },
}; 