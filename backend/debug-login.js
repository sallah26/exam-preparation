const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function debugLogin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing login functionality...');
    
    const email = 'admin@example.com';
    const password = 'Admin123!';
    
    // Step 1: Find admin
    console.log('📋 Step 1: Finding admin by email...');
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    if (!admin) {
      console.log('❌ Admin not found');
      return;
    }
    
    console.log('✅ Admin found:', {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      isActive: admin.isActive
    });
    
    // Step 2: Check if admin is active
    if (!admin.isActive) {
      console.log('❌ Admin is deactivated');
      return;
    }
    
    console.log('✅ Admin is active');
    
    // Step 3: Verify password
    console.log('🔐 Step 2: Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      console.log('❌ Password is invalid');
      return;
    }
    
    console.log('✅ Password is valid');
    console.log('🎉 Login would be successful!');
    
  } catch (error) {
    console.error('❌ Error during login test:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin(); 