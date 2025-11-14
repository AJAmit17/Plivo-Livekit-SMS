# SMS → Video Escalation - Quick Start Guide

## What Was Built

A complete end-to-end system for escalating SMS support requests to LiveKit video calls, featuring:

### ✅ Core Features Implemented
- [x] SMS webhook integration with Plivo
- [x] Automatic LiveKit room creation
- [x] Magic link generation with ephemeral tokens
- [x] Customer video client with connection quality indicators
- [x] Agent console with real-time room updates
- [x] SMS delivery tracking with callbacks
- [x] Call summaries with metadata persistence
- [x] Structured logging throughout the system
- [x] MongoDB database with Prisma ORM
- [x] Full TypeScript implementation

### 🏗️ Architecture Components

1. **Backend API Routes** (Next.js App Router)
   - `/api/plivo/sms-callback` - Receives inbound SMS
   - `/api/plivo/sms-status` - Tracks delivery status
   - `/api/rooms/waiting` - Lists active rooms
   - `/api/rooms/[roomId]/token/*` - Token generation
   - `/api/rooms/[roomId]/summary` - Call summary creation
   - `/api/webhooks/livekit/recording` - Recording webhooks

2. **Frontend Pages**
   - `/` - Landing page explaining the system
   - `/r/[roomId]` - Customer video room
   - `/agent` - Agent console dashboard

3. **Database Models** (Prisma + MongoDB)
   - `Room` - Video room metadata
   - `Participant` - Join/leave tracking
   - `SmsReceipt` - SMS delivery logs
   - `CallSummary` - Post-call data
   - `Recording` - Recording metadata

4. **Utility Libraries**
   - `lib/prisma.ts` - Database client
   - `lib/logger.ts` - Structured logging
   - `lib/plivo.ts` - SMS API wrapper
   - `lib/livekit.ts` - Token generation
   - `lib/repositories/*` - Data access layer

## Getting Started in 5 Minutes

### Prerequisites
```bash
✓ Node.js 20+
✓ MongoDB database (local or Atlas)
✓ Plivo account with SMS number
✓ LiveKit Cloud project
```

### Setup Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your credentials
```

3. **Setup Database**
```bash
npm run db:push
```

4. **Run Development Server**
```bash
npm run dev
```

5. **Expose Local Server** (for webhooks)
```bash
# Terminal 2
ngrok http 3000
```

6. **Configure Plivo Webhook**
- Go to Plivo Console → Your Number
- Set Message URL to: `https://your-ngrok-url.ngrok.io/api/plivo/sms-callback`

### Test the System

1. Send SMS to your Plivo number: "HELP"
2. Receive magic link via SMS reply
3. Open link in browser
4. Open `/agent` in another window
5. Join as agent and start video call

## File Structure Overview

```
plivo/
├── prisma/
│   └── schema.prisma                 # Database models
├── src/
│   ├── app/
│   │   ├── api/                      # Backend routes
│   │   ├── agent/                    # Agent console
│   │   ├── r/[roomId]/              # Customer room
│   │   └── page.tsx                  # Home page
│   ├── components/
│   │   └── agent/                    # Agent UI components
│   └── lib/
│       ├── prisma.ts                 # DB client
│       ├── logger.ts                 # Logging
│       ├── plivo.ts                  # SMS client
│       ├── livekit.ts                # Token gen
│       └── repositories/             # Data access
├── .env.example                      # Env template
├── .env.local                        # Your config
├── README.md                         # Full documentation
├── BLOCKERS.md                       # Issues & solutions
└── package.json
```

## Key Technologies

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | Full-stack framework |
| **React 19** | UI components |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Styling |
| **Prisma** | ORM |
| **MongoDB** | Database |
| **Plivo** | SMS API |
| **LiveKit** | Video infrastructure |
| **SWR** | Data fetching |

## Environment Variables Reference

### Required
```env
PLIVO_AUTH_ID=              # From Plivo Console
PLIVO_AUTH_TOKEN=           # From Plivo Console  
PLIVO_PHONE_NUMBER=         # Your SMS number
LIVEKIT_API_KEY=            # From LiveKit Console
LIVEKIT_API_SECRET=         # From LiveKit Console
LIVEKIT_URL=                # wss://your-instance.livekit.cloud
DATABASE_URL=               # MongoDB connection string
NEXT_PUBLIC_APP_URL=        # Your app URL (for SMS links)
```

## Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run lint                # Run linter

# Database
npm run db:generate         # Generate Prisma client
npm run db:push             # Push schema to DB
npm run db:studio           # Open Prisma Studio

# Production
npm run build               # Build for production
npm run start               # Start production server
```

## Deployment Checklist

- [ ] Set all environment variables in hosting platform
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Update Plivo webhook URLs to production endpoints
- [ ] Configure LiveKit recording webhook (optional)
- [ ] Test SMS flow end-to-end
- [ ] Verify agent console access
- [ ] Check database connection
- [ ] Monitor logs for errors

## API Flow Diagram

```
┌─────────────┐
│  Customer   │
│   Sends     │
│  "HELP"     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  Plivo Webhook                  │
│  POST /api/plivo/sms-callback   │
└────────┬────────────────────────┘
         │
         ├─► Create Room in DB
         ├─► Generate Customer Token
         ├─► Send SMS with Magic Link
         └─► Log SMS Receipt
         
┌─────────────┐         ┌─────────────┐
│  Customer   │◄───────►│   LiveKit   │
│   Browser   │         │    Room     │
└─────────────┘         └──────┬──────┘
                               │
┌─────────────┐                │
│   Agent     │◄───────────────┘
│  Console    │
└─────────────┘
```

## Support & Documentation

- **Full README**: See `README.md` for detailed documentation
- **Blockers Log**: See `BLOCKERS.md` for troubleshooting
- **Assignment Brief**: See `instructions.md` for requirements

## Next Steps

### Recommended Enhancements
1. Add agent authentication
2. Implement Plivo signature validation
3. Add rate limiting on webhooks
4. Set up monitoring/analytics
5. Configure LiveKit recording to S3/GCS
6. Add email notifications
7. Implement chat functionality
8. Add call quality metrics dashboard

### Production Considerations
- Use environment-specific MongoDB databases
- Implement proper error boundaries
- Add retry logic for failed webhooks
- Set up logging aggregation (e.g., DataDog, LogRocket)
- Configure CORS policies
- Add API rate limiting
- Implement webhook signature validation
- Set up health check endpoints

## Project Status

**Status**: ✅ Complete and Ready for Testing

All core requirements from the assignment have been implemented:
- ✅ SMS webhook with "HELP" trigger
- ✅ LiveKit room creation with ephemeral tokens
- ✅ Magic link SMS reply
- ✅ Customer web client with quality indicators
- ✅ Agent console with join functionality
- ✅ Recording support (webhook ready)
- ✅ Observability and logging
- ✅ Call summary persistence
- ✅ Delivery receipt tracking

**Estimated Development Time**: ~4-6 hours

---

Built with ❤️ for Plivo Assignment
