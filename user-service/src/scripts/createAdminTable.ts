import { db } from '@/config/database';
import { AdminTable } from '@/models/schema';
import { AdminModel } from '@/models/Admin';

async function createAdminTable() {
  try {
    console.log('Creating admin table...');

    // The table will be created automatically by Drizzle when the app starts
    // This script is for creating a default admin user

    console.log('Creating default admin user...');

    const defaultAdmin = {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123456',
      role: 'admin',
      permissions: ['users:read', 'users:write', 'admin:read', 'admin:write'],
      area: null, // You can set a polygon geometry here if needed
    };

    // Check if admin already exists
    const existingAdmin = await AdminModel.findByEmail(defaultAdmin.email);
    if (existingAdmin) {
      console.log('Default admin user already exists');
      return;
    }

    const admin = await AdminModel.create(defaultAdmin);
    console.log('Default admin user created successfully:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    console.log('Admin table setup completed successfully!');
  } catch (error) {
    console.error('Error creating admin table:', error);
    process.exit(1);
  }
}

// Run the script
createAdminTable();