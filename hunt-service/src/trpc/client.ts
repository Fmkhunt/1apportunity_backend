import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

const claimServiceUrl = process.env.CLAIM_SERVICE_URL || 'http://localhost:3002';

export const trpc = createTRPCProxyClient<any>({
  links: [
    httpBatchLink({
      url: `${claimServiceUrl}/trpc`,
    }),
  ],
});
