import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db } from '../config/database';
import { AdminTable, ZoneTable, UsersTable, ServiceLocationTable } from '../models/schema';
import { eq, sql, getTableColumns } from 'drizzle-orm';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  admin: router({
    getById: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        try {
          const rows = await db
          .select()
          .from(AdminTable)
          .where(eq(AdminTable.id, input))
          .limit(1);
          return rows[0] ?? null;
        } catch (error) {
          console.error(error)
        }
      }),
      getByCoordinates: publicProcedure
      .input(z.object({
        latitude: z.number(),
        longitude: z.number(),
      }))
      .query(async ({ input }) => {
        try {
          const rows = await db
          .select()
          .from(AdminTable)
          // .where(sql`ST_Within(ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326), ${AdminTable.area})`)
          .limit(1);
          return rows[0] ?? null;
        } catch (error) {
          console.error(error)
        }
      }),
  }),
  zone: router({
    getById: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        try {
          const rows = await db
          .select({
            ...getTableColumns(ZoneTable),
            coordinates_arr: sql<{ type: string, coordinates:[{ latitude: number; longitude: number}] }>`
              CASE
                WHEN ${ZoneTable.area} IS NOT NULL THEN
                ST_AsGeoJSON(${ZoneTable.area})
                ELSE NULL
              END
            `
          })
          .from(ZoneTable)
          .where(eq(ZoneTable.id, input))
          .limit(1);
          return rows[0] ?? null;
        } catch (error) {
          console.error(error)
        }
      }),
      getByCoordinates: publicProcedure
      .input(z.object({
        latitude: z.number(),
        longitude: z.number(),
      }))
      .query(async ({ input }) => {
        try {
          console.log(input)
          const rows = await db
          .select({
            ...getTableColumns(ZoneTable),
            coordinates_arr: sql<{ type: string, coordinates:[{ latitude: number; longitude: number}] }>`
              CASE
                WHEN ${ZoneTable.area} IS NOT NULL THEN
                ST_AsGeoJSON(${ZoneTable.area})
                ELSE NULL
              END
            `
          })
          .from(ZoneTable)
          .where(sql`
            ST_Within(
              ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326),
              ST_SetSRID(${ZoneTable.area}, 4326)
            )
          `)
          .limit(1);
          return rows[0] ?? null;
        } catch (error) {
          console.error(error)
        }
      }),
  }),
  user: router({
    getServiceLocation: publicProcedure
      .input(z.string())
      .query(async ({ input: userId }) => {
        try {
          // Get user first
          const user = await db
            .select()
            .from(UsersTable)
            .where(eq(UsersTable.id, userId))
            .limit(1);

          if (!user || user.length === 0 || !user[0].service_location_id) {
            return null;
          }

          // Get service location
          const serviceLocation = await db
            .select({
              id: ServiceLocationTable.id,
              payment_gateway: ServiceLocationTable.payment_gateway,
              token_rate: ServiceLocationTable.token_rate,
              coin_rate: ServiceLocationTable.coin_rate,
              currency: ServiceLocationTable.currency,
              currency_sign: ServiceLocationTable.currency_sign,
            })
            .from(ServiceLocationTable)
            .where(eq(ServiceLocationTable.id, user[0].service_location_id))
            .limit(1);

          if (!serviceLocation || serviceLocation.length === 0) {
            return null;
          }

          return serviceLocation[0];
        } catch (error) {
          console.error('Error fetching user service location:', error);
          return null;
        }
      }),
  }),

});

export type AppRouter = typeof appRouter;
