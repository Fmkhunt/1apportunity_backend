# tRPC Setup Documentation

## Overview
This project now uses tRPC for type-safe communication between the hunt-service and claim-service.

## Architecture

### Claim Service (tRPC Server)
- **Endpoint**: `http://localhost:3002/trpc`
- **Router**: Defined in `src/trpc/router.ts`
- **Available Procedures**:
  - `claim.getById(id: string)` - Get claim by ID
  - `claim.getAll(params)` - Get all claims with pagination
  - `claim.getByType(type: string)` - Get claims by type

### Hunt Service (tRPC Client)
- **Client**: Configured in `src/trpc/client.ts`
- **Usage**: Import `trpc` and call procedures like `trpc.claim.getById.query(id)`

## Installation

### Claim Service
```bash
cd claim-service
npm install @trpc/server zod
```

### Hunt Service
```bash
cd hunt-service
npm install @trpc/client
```

## Environment Variables

### Hunt Service (.env)
```
CLAIM_SERVICE_URL=http://localhost:3002
```

### Claim Service (.env)
```
PORT=3002
```

## Usage Example

In `huntClaim.service.ts`:
```typescript
import { trpc } from '../trpc/client';

// Call claim service
const claimData = await (trpc as any).claim.getById.query(claimId);
```

## Benefits
- Type-safe API calls
- Automatic serialization/deserialization
- Built-in error handling
- Request batching
- End-to-end type safety

## Testing
1. Start claim-service: `npm run dev` (port 3002)
2. Start hunt-service: `npm run dev` (port 3001)
3. Test the `completeHuntClaim` function which now uses tRPC
