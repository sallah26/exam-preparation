const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test admin query
    const adminCount = await prisma.admin.count();
    console.log(`📊 Found ${adminCount} admins in database`);
    
    // Test user query
    const userCount = await prisma.user.count();
    console.log(`👥 Found ${userCount} users in database`);
    
    // Test refresh token query
    const tokenCount = await prisma.refreshToken.count();
    console.log(`🔑 Found ${tokenCount} refresh tokens in database`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 