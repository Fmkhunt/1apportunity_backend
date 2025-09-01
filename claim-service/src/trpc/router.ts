import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';
import { ClaimService } from '../services/claim.service';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  claim: router({
    getById: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const claim = await ClaimService.getById(input);
        if (!claim) {
          throw new Error('Claim not found');
        }
        return claim;
      }),
    
    getAll: publicProcedure
      .input(z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(10),
        claim_type: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await ClaimService.getAll(input);
      }),

    getByType: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return await ClaimService.getByType(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
