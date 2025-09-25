import { db } from '../config/database';
import { AdminTable } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { TAdmin, TAdminCreate, TAdminUpdate } from '../types/admin';

export class AdminModel {
  /**
   * Create a new admin
   */
  static async create(adminData: TAdminCreate): Promise<TAdmin> {
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    const [admin] = await db.insert(AdminTable).values({
      ...adminData,
      password: hashedPassword,
    }).returning();

    return admin as TAdmin;
  }

  /**
   * Find admin by email
   */
  static async findByEmail(email: string): Promise<TAdmin | null> {
    const admin = await db.query.AdminTable.findFirst({
      where: eq(AdminTable.email, email),
    });
    return admin as TAdmin | null;
  }

  /**
   * Find admin by ID
   */
  static async findById(id: string): Promise<TAdmin | null> {
    const admin = await db.query.AdminTable.findFirst({
      where: eq(AdminTable.id, id),
    });
    return admin as TAdmin | null;
  }

  /**
   * Update admin
   */
  static async updateById(id: string, updateData: TAdminUpdate): Promise<TAdmin | null> {
    const updateFields: any = { ...updateData };

    // Hash password if it's being updated
    if (updateData.password) {
      updateFields.password = await bcrypt.hash(updateData.password, 12);
    }
    const [admin] = await db.update(AdminTable)
      .set({
        ...updateFields,
        permissions: updateFields.permissions,
        updated_at: new Date(),
      })
      .where(eq(AdminTable.id, id))
      .returning();

    return admin as TAdmin | null;
  }

  /**
   * Delete admin
   */
  static async deleteById(id: string): Promise<boolean> {
    const result = await db.delete(AdminTable).where(eq(AdminTable.id, id));
    return result.rowCount > 0;
  }

  /**
   * Get all admins
   */
  static async findAll(): Promise<TAdmin[]> {
    const admins = await db.query.AdminTable.findMany();
    return admins as unknown as TAdmin[];
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}