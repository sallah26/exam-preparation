import { prisma } from '../prisma/client';
import { JWTService } from '../modules/auth/services/jwt.service';

export class SuperAdminInitService {
  private static readonly DEFAULT_SUPER_ADMIN = {
    email: 'selahadinhamid26@gmail.com',
    password: '12341234',
    fullName: 'Selahadin Hamid'
  };

  /**
   * Initialize default super admin on server startup
   */
  static async initializeDefaultSuperAdmin(): Promise<void> {
    try {
      console.log('🔍 Checking for default super admin...');

      // Check if the default super admin exists
      let admin = await prisma.admin.findUnique({
        where: { email: this.DEFAULT_SUPER_ADMIN.email },
        select: {
          id: true,
          email: true,
          fullName: true,
          isSuperAdmin: true,
          isActive: true,
        },
      });

      if (!admin) {
        // Create the default super admin if it doesn't exist
        console.log('👑 Creating default super admin...');

        const hashedPassword = await JWTService.hashPassword(this.DEFAULT_SUPER_ADMIN.password);

        admin = await prisma.admin.create({
          data: {
            email: this.DEFAULT_SUPER_ADMIN.email,
            fullName: this.DEFAULT_SUPER_ADMIN.fullName,
            password: hashedPassword,
            isSuperAdmin: true,
            isActive: true,
          },
          select: {
            id: true,
            email: true,
            fullName: true,
            isSuperAdmin: true,
            isActive: true,
          },
        });

        console.log(`✅ Default super admin created: ${admin.email}`);
      } else {
        // Update existing admin to ensure super admin status and correct password
        if (!admin.isSuperAdmin || !admin.isActive) {
          console.log('👑 Updating admin to super admin status...');

          const hashedPassword = await JWTService.hashPassword(this.DEFAULT_SUPER_ADMIN.password);

          admin = await prisma.admin.update({
            where: { email: this.DEFAULT_SUPER_ADMIN.email },
            data: {
              isSuperAdmin: true,
              isActive: true,
              password: hashedPassword, // Update password to ensure it's correct
              fullName: this.DEFAULT_SUPER_ADMIN.fullName, // Ensure name is correct
            },
            select: {
              id: true,
              email: true,
              fullName: true,
              isSuperAdmin: true,
              isActive: true,
            },
          });

          console.log(`✅ Admin promoted to super admin: ${admin.email}`);
        } else {
          // Just update the password to ensure it's always correct
          const hashedPassword = await JWTService.hashPassword(this.DEFAULT_SUPER_ADMIN.password);

          await prisma.admin.update({
            where: { email: this.DEFAULT_SUPER_ADMIN.email },
            data: {
              password: hashedPassword,
            },
          });

          console.log(`✅ Default super admin verified: ${admin.email}`);
        }
      }

      // Verify super admin functionality
      console.log('🔧 Super admin system ready');
      console.log(`📧 Super admin email: ${this.DEFAULT_SUPER_ADMIN.email}`);
      console.log(`🔑 Super admin password: ${this.DEFAULT_SUPER_ADMIN.password}`);
      console.log('🌐 Super admin endpoints available at: /api/super-admin/*');

    } catch (error) {
      console.error('❌ Error initializing default super admin:', error);
      throw error;
    }
  }

  /**
   * Get super admin credentials (for development/testing)
   */
  static getSuperAdminCredentials() {
    return {
      email: this.DEFAULT_SUPER_ADMIN.email,
      password: this.DEFAULT_SUPER_ADMIN.password,
    };
  }

  /**
   * Test super admin login
   */
  static async testSuperAdminLogin(): Promise<boolean> {
    try {
      const admin = await prisma.admin.findUnique({
        where: { email: this.DEFAULT_SUPER_ADMIN.email },
      });

      if (!admin || !admin.isSuperAdmin || !admin.isActive) {
        return false;
      }

      const passwordValid = await JWTService.verifyPassword(
        this.DEFAULT_SUPER_ADMIN.password,
        admin.password
      );

      return passwordValid;
    } catch (error) {
      console.error('Error testing super admin login:', error);
      return false;
    }
  }
} 