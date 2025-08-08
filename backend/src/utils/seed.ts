import { prisma } from '../prisma/client';

/**
 * Seed the database with sample data for development
 */
export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if users already exist
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('📊 Database already has data, skipping seed...');
      return;
    }

    // Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
      },
      {
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
      },
      {
        name: 'Charlie Wilson',
        email: 'charlie.wilson@example.com',
      },
    ];

    const createdUsers = await prisma.user.createMany({
      data: sampleUsers,
    });

    console.log(`✅ Successfully created ${createdUsers.count} users`);
    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 