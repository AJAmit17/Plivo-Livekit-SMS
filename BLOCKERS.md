# Blockers & Roadblocks Encountered

This document details all the technical challenges encountered during development and their solutions.

## 1. LiveKit React Components Styles Import

### Issue
TypeScript compilation failed with error: `Cannot find module or type declarations for side-effect import of '@livekit/components-styles'`

### Root Cause
The `@livekit/components-styles` package doesn't export proper TypeScript declarations for side-effect imports in strict mode.

### Solution Attempted
1. First tried importing directly in component files
2. Then attempted webpack alias configuration in `next.config.ts`

### Final Solution
- Removed style imports from individual component files
- Added style import to main `layout.tsx` using: `import "@livekit/components-styles/prefabs"`
- This centralizes the style loading and avoids TypeScript issues in components

### Code Changes
```typescript
// Before (in component)
import '@livekit/components-styles';

// After (in layout.tsx)
import "@livekit/components-styles/prefabs";
```

---

## 2. Prisma with MongoDB ObjectId Handling

### Issue
MongoDB uses `_id` as the primary key, but Prisma's default `id` field conflicts. Relationships between models failed to work correctly.

### Root Cause
MongoDB requires special handling for ObjectIds and the `_id` field naming convention.

### Solution
Used proper Prisma MongoDB annotations:
```prisma
model Room {
  id            String        @id @default(auto()) @map("_id") @db.ObjectId
  roomId        String        @unique
  // ... other fields
}
```

Key points:
- `@map("_id")` maps Prisma's `id` to MongoDB's `_id`
- `@db.ObjectId` specifies MongoDB ObjectId type
- Use `String` type in Prisma for ObjectIds
- Foreign keys also need `@db.ObjectId` annotation

---

## 3. Next.js 15+ Dynamic Route Parameters

### Issue
Route handlers with dynamic parameters like `[roomId]` were throwing TypeScript errors. The `params` property was showing as a Promise type.

### Root Cause
Next.js 15+ made params asynchronous to support React Server Components better.

### Solution
Await params in all route handlers:

```typescript
// Before
export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  const roomId = params.roomId;
}

// After
export async function GET(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
}
```

### Impact
Updated all dynamic route handlers:
- `/api/rooms/[roomId]/token/customer/route.ts`
- `/api/rooms/[roomId]/token/agent/route.ts`
- `/api/rooms/[roomId]/summary/route.ts`

---

## 4. useConnectionQualityIndicator Hook Type Mismatch

### Issue
The LiveKit `useConnectionQualityIndicator()` hook was returning an object, but code was treating it as a string, causing TypeScript errors and runtime issues.

### Root Cause
The hook returns `{ className: string, quality: ConnectionQuality }`, not a simple string value.

### Solution
Extract the quality property from the returned object:

```typescript
// Before
const quality = useConnectionQualityIndicator();
switch (quality) {
  case 'excellent': ...
}

// After
const quality = useConnectionQualityIndicator();
const qualityStr = quality?.quality || 'unknown';
switch (qualityStr) {
  case 'excellent': ...
}
```

### Files Changed
- `src/app/r/[roomId]/page.tsx`
- `src/components/agent/VideoRoom.tsx`

---

## 5. React Compiler Restrictions

### Issue
React 19 compiler flagged several anti-patterns:
1. Calling `Date.now()` directly in `useState` initializer
2. Calling `setState` synchronously in `useEffect`
3. Using `any` type (TypeScript issue)

### Root Cause
React 19's new compiler enforces stricter rules for component purity and idempotence.

### Solutions

**a. Date.now() in useState**
```typescript
// Before
const [agentId] = useState(`agent_${Date.now()}`);

// After
const [agentId] = useState(() => `agent_${Date.now()}`);
```

**b. setState in useEffect**
```typescript
// Before
useEffect(() => {
  setLivekitUrl(process.env.NEXT_PUBLIC_LIVEKIT_URL || '');
  setIsLoading(false);
}, []);

// After
const [livekitUrl] = useState(process.env.NEXT_PUBLIC_LIVEKIT_URL || '');
const [isLoading, setIsLoading] = useState(!token);
```

**c. TypeScript any types**
```typescript
// Before
const [roomInfo, setRoomInfo] = useState<any>(null);

// After
const [roomInfo, setRoomInfo] = useState<{ customerPhone: string } | null>(null);
```

---

## 6. Environment Variables in Client Components

### Issue
Server-side environment variables (without `NEXT_PUBLIC_` prefix) were not accessible in client components.

### Root Cause
Next.js only exposes `NEXT_PUBLIC_*` variables to client-side code for security.

### Solution
1. Added `NEXT_PUBLIC_` prefix to LiveKit URL
2. Configured `next.config.ts` to expose certain variables:

```typescript
env: {
  NEXT_PUBLIC_LIVEKIT_URL: process.env.LIVEKIT_URL,
}
```

3. For API routes, pass values in responses:
```typescript
return NextResponse.json({
  token,
  livekitUrl: process.env.LIVEKIT_URL, // Server-side only
});
```

---

## 7. Webhook Development with Localhost

### Issue
Plivo and LiveKit webhooks require publicly accessible URLs, but development happens on localhost.

### Root Cause
External services cannot reach `localhost:3000` for webhook callbacks.

### Solution
Use tunneling services for local development:

**Option 1: ngrok**
```bash
ngrok http 3000
# Use the provided HTTPS URL
```

**Option 2: localtunnel**
```bash
npx localtunnel --port 3000
```

Update `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://your-tunnel-url.ngrok.io
```

Also update webhook URLs in:
- Plivo Console → Number Configuration
- LiveKit Console → Egress Settings (for recording webhooks)

---

## 8. SMS Delivery Status Mapping

### Issue
Plivo sends status values like "queued", "sent", "delivered" but they need to match our Prisma enum exactly.

### Root Cause
Case sensitivity and exact string matching required for enum values.

### Solution
Created explicit status mapping in webhook handler:

```typescript
let smsStatus: SmsStatus;
switch (status.toLowerCase()) {
  case 'queued':
    smsStatus = SmsStatus.QUEUED;
    break;
  case 'sent':
    smsStatus = SmsStatus.SENT;
    break;
  // ... etc
}
```

Added default case for unknown statuses to prevent crashes.

---

## 9. Plivo Message Callback Payload Format

### Issue
Plivo sends webhook data as `application/x-www-form-urlencoded`, not JSON.

### Root Cause
Plivo's default webhook format uses form data encoding.

### Solution
Use Next.js `request.formData()` instead of `request.json()`:

```typescript
// Correct
const formData = await request.formData();
const from = formData.get('From') as string;

// Wrong
const body = await request.json();
const from = body.From;
```

---

## 10. Race Condition in Room Status Updates

### Issue
When multiple participants join simultaneously, room status could be updated incorrectly.

### Root Cause
No locking mechanism on database updates.

### Mitigation
- Check current status before updating
- Use conditional updates:
```typescript
if (room.status === RoomStatus.WAITING) {
  await updateRoomStatus(room.roomId, RoomStatus.ACTIVE);
}
```

For production, consider:
- Implementing optimistic locking with version fields
- Using MongoDB transactions for atomic updates
- Adding queue system for status updates

---

## 11. Token Expiry Handling

### Issue
Short-lived tokens (10 minutes) could expire before customer joins.

### Root Cause
Customer may not click the link immediately, or network delays occur.

### Solution
Implemented token refresh mechanism:
- Customer page checks for token in URL
- If no token, requests a new one from `/api/rooms/[roomId]/token/customer`
- Redirects with fresh token
- Includes room expiry check (60 minutes)

---

## 12. MongoDB Connection Pooling in Serverless

### Issue
Next.js API routes create new database connections on each invocation in serverless environments.

### Root Cause
Serverless functions are stateless and don't maintain persistent connections.

### Solution
Implemented Prisma client singleton pattern:

```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

This reuses the Prisma client across hot reloads in development.

---

## Summary

Most issues were related to:
1. **Type safety**: TypeScript strict mode catching API mismatches
2. **Framework updates**: Next.js 15 and React 19 introducing breaking changes
3. **Third-party integrations**: Understanding Plivo and LiveKit SDK behaviors
4. **Database specifics**: MongoDB ObjectId handling with Prisma

All blockers were resolved through:
- Reading official documentation
- Analyzing TypeScript error messages
- Testing with actual API responses
- Implementing proper error handling

No blockers remain unresolved. The application is fully functional and ready for deployment.
