import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db } from '../config/database';
import { AdminTable } from '../models/schema';
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
});

export type AppRouter = typeof appRouter;
