const { PrismaClient } = require('@prisma/client');

async function checkAdmins() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking all admins in database...');
    
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Found ${admins.length} admins:`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.fullName}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking admins:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins(); 