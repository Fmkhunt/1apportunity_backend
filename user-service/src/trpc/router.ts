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
    incrementTokens: publicProcedure
      .input(z.object({
        userId: z.string().uuid(),
        quantity: z.number().int().positive(),
        paymentTransactionId: z.string().uuid(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Increment user tokens
          const [updatedUser] = await db
            .update(UsersTable)
            .set({
              token: sql`${UsersTable.token} + ${input.quantity}`,
              updated_at: new Date(),
            })
            .where(eq(UsersTable.id, input.userId))
            .returning({
              id: UsersTable.id,
              token: UsersTable.token,
            });

          if (!updatedUser) {
            throw new Error('User not found');
          }

          console.log(`Incremented ${input.quantity} tokens for user ${input.userId}. New token count: ${updatedUser.token}`);

          return {
            success: true,
            userId: updatedUser.id,
            newTokenCount: updatedUser.token,
          };
        } catch (error) {
          console.error('Error incrementing tokens:', error);
          throw new Error(`Failed to increment tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
    getBalance: publicProcedure
      .input(z.string().uuid())
      .query(async ({ input: userId }) => {
        try {
          const user = await db
            .select({
              id: UsersTable.id,
              balance: UsersTable.balance,
            })
            .from(UsersTable)
            .where(eq(UsersTable.id, userId))
            .limit(1);

          if (!user || user.length === 0) {
            throw new Error('User not found');
          }

          return {
            success: true,
            userId: user[0].id,
            balance: user[0].balance || 0,
          };
        } catch (error) {
          console.error('Error fetching user balance:', error);
          throw new Error(`Failed to get user balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
    deductBalance: publicProcedure
      .input(z.object({
        userId: z.string().uuid(),
        amount: z.number().int().positive(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Check if user exists and has sufficient balance
          const user = await db
            .select({
              id: UsersTable.id,
              balance: UsersTable.balance,
            })
            .from(UsersTable)
            .where(eq(UsersTable.id, input.userId))
            .limit(1);

          if (!user || user.length === 0) {
            throw new Error('User not found');
          }

          const currentBalance = user[0].balance || 0;
          if (currentBalance < input.amount) {
            throw new Error(`Insufficient balance. Current balance: ${currentBalance}, Required: ${input.amount}`);
          }

          // Deduct balance
          const [updatedUser] = await db
            .update(UsersTable)
            .set({
              balance: sql`${UsersTable.balance} - ${input.amount}`,
              updated_at: new Date(),
            })
            .where(eq(UsersTable.id, input.userId))
            .returning({
              id: UsersTable.id,
              balance: UsersTable.balance,
            });

          if (!updatedUser) {
            throw new Error('Failed to update user balance');
          }

          console.log(`Deducted ${input.amount} coins from user ${input.userId}. New balance: ${updatedUser.balance}`);

          return {
            success: true,
            userId: updatedUser.id,
            newBalance: updatedUser.balance,
          };
        } catch (error) {
          console.error('Error deducting balance:', error);
          throw new Error(`Failed to deduct balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
  }),

});

export type AppRouter = typeof appRouter;
