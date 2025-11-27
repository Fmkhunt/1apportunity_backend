import { db, connectDatabase, disconnectDatabase } from '../config/database';
import { configTable } from '../models/schema';
import { eq } from 'drizzle-orm';

async function seedConfig() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('Seeding config table...');

    // Check if max_scans config already exists
    const existingConfig = await db
      .select()
      .from(configTable)
      .where(eq(configTable.key, 'max_scans'))
      .limit(1);

    if (existingConfig.length > 0) {
      console.log('Config entry with key "max_scans" already exists');
      await disconnectDatabase();
      return;
    }

    // Insert max_scans config
    const [newConfig] = await db
      .insert(configTable)
      .values({
        key: 'max_scans',
        value: '5',
      })
      .returning();

    console.log('Config seeded successfully:', {
      id: newConfig.id,
      key: newConfig.key,
      value: newConfig.value,
    });

    console.log('Config seeding completed successfully!');
    
    // Disconnect from database
    await disconnectDatabase();
  } catch (error) {
    console.error('Error seeding config:', error);
    await disconnectDatabase();
    process.exit(1);
  }
}

// Run the script
seedConfig()
  .then(() => {
    console.log('Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });

