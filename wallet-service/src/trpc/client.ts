import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

const claimServiceUrl = process.env.CLAIM_SERVICE_URL || 'http://localhost:3002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3000';

export const trpc = createTRPCProxyClient<any>({
  links: [
    httpBatchLink({
      url: `${claimServiceUrl}/trpc`,
    }),
  ],
});

export const trpcClaim = trpc;

export const trpcUser = createTRPCProxyClient<any>({
  links: [
    httpBatchLink({
      url: `${userServiceUrl}/trpc`,
    }),
  ],
});
