import { db } from '../config/database';
import { ZoneTable } from './schema';
import { eq, sql } from 'drizzle-orm';
import { TZone, TZoneCreate, TZoneUpdate } from '../types/zone';
import wellknown from 'wellknown';

export class ZoneModel {
  /**
   * Create a new zone
   */
  static async create(zoneData: TZoneCreate): Promise<TZone> {
    const [zone] = await db.insert(ZoneTable).values({
      ...zoneData,
      area: zoneData.area ? sql.raw(`ST_GeomFromText('${zoneData.area}', 4326)`) : undefined,
      updated_at: new Date(),
    }).returning();

    return zone as TZone;
  }

  /**
   * Find zone by ID
   */
  static async findById(id: string): Promise<TZone | null> {
    const zone = await db.query.ZoneTable.findFirst({
      where: eq(ZoneTable.id, id),
    });
    if (zone?.area) {
      zone.area = wellknown.parse(zone.area);
    }
    return zone as TZone | null;
  }

  /**
   * Find zones by service location ID
   */
  static async findByServiceLocationId(serviceLocationId: string): Promise<TZone[]> {
    const zones = await db.query.ZoneTable.findMany({
      where: eq(ZoneTable.service_location_id, serviceLocationId),
    });
    return zones as unknown as TZone[];
  }

  /**
   * Update zone
   */
  static async updateById(id: string, updateData: TZoneUpdate): Promise<TZone | null> {
    const updateFields: any = { ...updateData };
    
    if (updateData.area) {
      updateFields.area = sql.raw(`ST_GeomFromText('${updateData.area}', 4326)`);
    }

    const [zone] = await db.update(ZoneTable)
      .set({
        ...updateFields,
        updated_at: new Date(),
      })
      .where(eq(ZoneTable.id, id))
      .returning();

    return zone as TZone | null;
  }

  /**
   * Delete zone
   */
  static async deleteById(id: string): Promise<boolean> {
    const result = await db.delete(ZoneTable).where(eq(ZoneTable.id, id));
    return result.rowCount > 0;
  }

  /**
   * Get all zones
   */
  static async findAll(): Promise<TZone[]> {
    const zones = await db.query.ZoneTable.findMany();
    return zones as unknown as TZone[];
  }
}