import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { createContext } from './context';

export const createTRPCServer = () => {
  const app = express();

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
};

export { appRouter } from './router';
export type { AppRouter } from './router';
