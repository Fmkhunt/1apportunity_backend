import { db } from '@/config/database';
import { AdminModel } from '@/models/Admin';
import { AdminTable } from '@/models/schema';
import { TAdminCreate, TAdminUpdate } from '@/types/admin';
import { AppError } from '@/utils/AppError';
import { and, eq, like, ne, sql } from 'drizzle-orm';

export class ZoneManagerService {

  static async create(data: TAdminCreate) {
    // Check if email already exists
    const existing = await AdminModel.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email is already registered', 409);
    }
    const polygon = this.coordinatesToWKT(data.coordinates || []);
    const admin = await AdminModel.create({
      email: data.email,
      password: data.password,
      role: 'zone_manager',
      permissions: data.permissions,
      area: polygon,
    });
    return admin;
  }


  static async getAll(page: number, limit: number, search: string | null = null) {
    const offset = (page - 1) * limit;

    // 1️⃣ Build where clause
    let whereClause: any;
    if (search) {
      whereClause = and(
        eq(AdminTable.role, 'zone_manager'),
        like(AdminTable.email, `%${search}%`)
      );
    } else {
      whereClause = eq(AdminTable.role, 'zone_manager');
    }
    // 2️⃣ Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(AdminTable)
      .where(whereClause);
    const total = totalResult[0]?.count ?? 0;

    // 3️⃣ Get paginated data
    const admins = await db.query.AdminTable.findMany({
      where: whereClause,
      columns: {
        id: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
      limit,
      offset,
    });

    // 4️⃣ Return result
    return {
      list: admins,
      total,
      page,
      limit,
    };
  }

  static async getById(id: string) {
    const admin = await db.query.AdminTable.findFirst({
      where: eq(AdminTable.id, id),
      columns: {
        id: true,
        email: true,
        role: true,
        area: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!admin || admin.role !== 'zone_manager') return null;
    return admin;
  }

  static async update(id: string, data: TAdminUpdate) {
    const admin = await AdminModel.findById(id);
    if (!admin || admin.role !== 'zone_manager') return null;
    // If updating email, check for conflicts
    if (data.email && data.email !== admin.email) {
      const existing = await db.query.AdminTable.findFirst({
        where: and(eq(AdminTable.email, data.email), ne(AdminTable.id, id)),
      });
      if (existing) {
        throw new AppError('Email is already registered', 409);
      }
    }
    let updateData = { ...data };
    if (data.coordinates) {
      updateData.area = this.coordinatesToWKT(data.coordinates);
    }
    delete updateData.coordinates;

    const updated = await AdminModel.updateById(id, updateData);
    return updated;
  }

  static async delete(id: string) {
    const admin = await AdminModel.findById(id);
    if (!admin || admin.role !== 'zone_manager') return false;
    return AdminModel.deleteById(id);
  }
  static coordinatesToWKT(coords: { latitude: number; longitude: number }[]): string {
    const points = coords.map(c => `${c.longitude} ${c.latitude}`).join(', ');
    // Close the polygon by repeating the first point
    const firstPoint = `${coords[0].longitude} ${coords[0].latitude}`;
    return `POLYGON((${points}, ${firstPoint}))`;
  }

}
