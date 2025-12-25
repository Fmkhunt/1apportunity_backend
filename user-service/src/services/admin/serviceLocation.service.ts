import { db } from '../../config/database';
import { ServiceLocationTable } from '../../models/schema';
import { eq, and, or, like, desc, asc, sql, getTableColumns, ilike } from 'drizzle-orm';
import { TServiceLocation, TServiceLocationCreate, TServiceLocationUpdate } from '../../types/serviceLocation';
import { AppError } from '../../utils/AppError';

export interface TServiceLocationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  map?: string;
  payment_gateway?: string;
  coin_rate?: string;
  token_rate?: string;
}

export class ServiceLocationService {

  /**
   * Create a new service location
   */
  static async createServiceLocation(serviceLocationData: TServiceLocationCreate): Promise<TServiceLocation> {
    try {
      // Check if service location with same country already exists
      const existingServiceLocation = await db.query.ServiceLocationTable.findFirst({
        where: eq(ServiceLocationTable.country, serviceLocationData.country),
      });

      if (existingServiceLocation) {
        throw new AppError('Service location with this country already exists', 400);
      }

      const [serviceLocation] = await db.insert(ServiceLocationTable).values({
        ...serviceLocationData,
        coin_rate: serviceLocationData.coin_rate,
        token_rate: serviceLocationData.token_rate,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning();

      return serviceLocation as TServiceLocation;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create service location', 500);
    }
  }

  /**
   * Get all service locations with pagination, search, and filters
   */
  static async getAllServiceLocations(queryParams: TServiceLocationQueryParams): Promise<{
    serviceLocations: TServiceLocation[];
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        country,
        timezone,
        currency,
        map,
        payment_gateway
      } = queryParams;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (country) {
        whereConditions.push(eq(ServiceLocationTable.country, country));
      }

      if (timezone) {
        whereConditions.push(eq(ServiceLocationTable.timezone, timezone));
      }

      if (currency) {
        whereConditions.push(eq(ServiceLocationTable.currency, currency));
      }

      if (map) {
        whereConditions.push(eq(ServiceLocationTable.map, map));
      }

      if (payment_gateway) {
        whereConditions.push(eq(ServiceLocationTable.payment_gateway, payment_gateway));
      }

      if (search) {
        whereConditions.push(
          or(
            ilike(ServiceLocationTable.country, `%${search}%`),
            ilike(ServiceLocationTable.timezone, `%${search}%`),
            // like(ServiceLocationTable.currency, `%${search}%`),
            // like(ServiceLocationTable.currency_sign, `%${search}%`),
            ilike(ServiceLocationTable.map, `%${search}%`),
            ilike(ServiceLocationTable.payment_gateway, `%${search}%`)
          )
        );
      }

      const whereClause = whereConditions.length > 0
        ? and(...whereConditions)
        : undefined;

      // Get service locations with pagination
      const serviceLocations = await db
        .select({
          ...getTableColumns(ServiceLocationTable),
        })
        .from(ServiceLocationTable)
        .where(whereClause)
        .orderBy(desc(ServiceLocationTable.created_at))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(ServiceLocationTable)
        .where(whereClause);

      const totalPages = Math.ceil(count / limit);

      return {
        serviceLocations: serviceLocations as TServiceLocation[],
        totalRecords: Number(count),
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new AppError('Failed to get service locations', 500);
    }
  }

  /**
   * Get service location by ID
   */
  static async getServiceLocationById(id: string): Promise<TServiceLocation> {
    try {
      const serviceLocation = await db.query.ServiceLocationTable.findFirst({
        where: eq(ServiceLocationTable.id, id),
      });

      if (!serviceLocation) {
        throw new AppError('Service location not found', 404);
      }

      return serviceLocation as TServiceLocation;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get service location', 500);
    }
  }

  /**
   * Update service location
   */
  static async updateServiceLocation(id: string, updateData: TServiceLocationUpdate): Promise<TServiceLocation> {
    try {
      // Check if service location exists
      const existingServiceLocation = await db.query.ServiceLocationTable.findFirst({
        where: eq(ServiceLocationTable.id, id),
      });

      if (!existingServiceLocation) {
        throw new AppError('Service location not found', 404);
      }

      // Check if country is being updated and if it already exists
      if (updateData.country && updateData.country !== existingServiceLocation.country) {
        const countryExists = await db.query.ServiceLocationTable.findFirst({
          where: eq(ServiceLocationTable.country, updateData.country),
        });

        if (countryExists) {
          throw new AppError('Service location with this country already exists', 400);
        }
      }

      const [updatedServiceLocation] = await db
        .update(ServiceLocationTable)
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where(eq(ServiceLocationTable.id, id))
        .returning();

      if (!updatedServiceLocation) {
        throw new AppError('Failed to update service location', 500);
      }

      return updatedServiceLocation as TServiceLocation;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update service location', 500);
    }
  }

  /**
   * Delete service location
   */
  static async deleteServiceLocation(id: string): Promise<boolean> {
    try {
      // Check if service location exists
      const existingServiceLocation = await db.query.ServiceLocationTable.findFirst({
        where: eq(ServiceLocationTable.id, id),
      });

      if (!existingServiceLocation) {
        throw new AppError('Service location not found', 404);
      }

      const result = await db
        .delete(ServiceLocationTable)
        .where(eq(ServiceLocationTable.id, id));

      return result.rowCount > 0;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete service location', 500);
    }
  }
}