import { db } from '../config/database';
import { ServiceLocationTable } from './schema';
import { eq } from 'drizzle-orm';
import { TServiceLocation, TServiceLocationCreate, TServiceLocationUpdate } from '../types/serviceLocation';

export class ServiceLocationModel {
  /**
   * Create a new service location
   */
  static async create(serviceLocationData: TServiceLocationCreate): Promise<TServiceLocation> {
    const [serviceLocation] = await db.insert(ServiceLocationTable).values({
      ...serviceLocationData,
      updated_at: new Date(),
    }).returning();

    return serviceLocation as TServiceLocation;
  }

  /**
   * Find service location by ID
   */
  static async findById(id: string): Promise<TServiceLocation | null> {
    const serviceLocation = await db.query.ServiceLocationTable.findFirst({
      where: eq(ServiceLocationTable.id, id),
    });
    return serviceLocation as TServiceLocation | null;
  }

  /**
   * Find service location by country
   */
  static async findByCountry(country: string): Promise<TServiceLocation | null> {
    const serviceLocation = await db.query.ServiceLocationTable.findFirst({
      where: eq(ServiceLocationTable.country, country),
    });
    return serviceLocation as TServiceLocation | null;
  }

  /**
   * Update service location
   */
  static async updateById(id: string, updateData: TServiceLocationUpdate): Promise<TServiceLocation | null> {
    const [serviceLocation] = await db.update(ServiceLocationTable)
      .set({
        ...updateData,
        updated_at: new Date(),
      })
      .where(eq(ServiceLocationTable.id, id))
      .returning();

    return serviceLocation as TServiceLocation | null;
  }

  /**
   * Delete service location
   */
  static async deleteById(id: string): Promise<boolean> {
    const result = await db.delete(ServiceLocationTable).where(eq(ServiceLocationTable.id, id));
    return result.rowCount > 0;
  }

  /**
   * Get all service locations
   */
  static async findAll(): Promise<TServiceLocation[]> {
    const serviceLocations = await db.query.ServiceLocationTable.findMany();
    return serviceLocations as unknown as TServiceLocation[];
  }
}