# SMS → Video Escalation with LiveKit & Plivo

A comprehensive end-to-end solution for escalating SMS support requests to video calls. Customers text "HELP" to a Plivo number and instantly receive a video call link powered by LiveKit.

## 🎯 Features

- **SMS Webhook Integration**: Automatic room creation when customers text "HELP"
- **Magic Link Generation**: Secure, ephemeral video room links sent via SMS
- **Customer Video Client**: Web-based video interface with connection quality indicators
- **Agent Console**: Real-time dashboard showing waiting rooms
- **Call Recording**: Automatic recording with LiveKit Egress
- **Delivery Tracking**: SMS delivery receipts with status callbacks
- **Call Summaries**: Persistent storage of call metadata and recordings
- **Observability**: Comprehensive logging throughout the system

## 🏗️ Architecture

```
Customer SMS → Plivo Webhook → Next.js API
                                    ↓
                              Create Room + Token
                                    ↓
                            Send SMS with Magic Link
                                    ↓
Customer Browser ←→ LiveKit Room ←→ Agent Console
                          ↓
                    Recording & Summary
```

### Tech Stack

- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js App Router API routes
- **Database**: MongoDB with Prisma ORM
- **SMS**: Plivo SMS API
- **Video**: LiveKit Cloud/Self-hosted
- **Real-time Updates**: SWR for polling

## 📋 Prerequisites

1. **Node.js** 20+ installed
2. **MongoDB** database (Atlas or local)
3. **Plivo Account** with SMS-enabled number
4. **LiveKit** Cloud project or self-hosted instance

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd plivo
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

**Required Environment Variables:**

```env
# Plivo Configuration
PLIVO_AUTH_ID=your_plivo_auth_id
PLIVO_AUTH_TOKEN=your_plivo_auth_token
PLIVO_PHONE_NUMBER=your_plivo_phone_number

# LiveKit Configuration
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-livekit-instance.livekit.cloud

# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/plivo-livekit?retryWrites=true&w=majority"

# Application URL (for SMS links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Generate Prisma client and push schema to MongoDB:

```bash
npx prisma generate
npx prisma db push
```

### 4. Plivo Configuration

#### a. Configure SMS Webhook

1. Go to [Plivo Console](https://console.plivo.com/)
2. Navigate to your SMS-enabled number
3. Set **Message URL** to: `https://your-domain.com/api/plivo/sms-callback`
4. Set **HTTP Method** to: `POST`

#### b. Configure Delivery Callbacks

The system automatically includes delivery callback URLs when sending SMS messages.

### 5. LiveKit Configuration (Optional Recording)

If you want to enable automatic recording:

1. In LiveKit Console, go to Settings → Egress
2. Configure output destination (S3, GCS, or Azure)
3. Set webhook URL to: `https://your-domain.com/api/webhooks/livekit/recording`

### 6. Development Setup

For local development, expose your local server:

```bash
# Using ngrok
ngrok http 3000

# Or using localtunnel
npx localtunnel --port 3000
```

Update your `.env.local` with the public URL:
```env
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io
```

### 7. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the home page.

## 📱 Usage

### For Customers

1. Send an SMS with "HELP" to your Plivo number
2. Receive an SMS reply with a magic link
3. Click the link to join the video room
4. Wait for an agent to join

### For Agents

1. Navigate to `/agent` to access the agent console
2. View all waiting rooms with customer information
3. Click "Join as Agent" to enter a video call
4. End the call when finished (summary is auto-saved)

## 🔌 API Endpoints

### Webhooks

- `POST /api/plivo/sms-callback` - Receives inbound SMS from Plivo
- `POST /api/plivo/sms-status` - Receives SMS delivery status updates
- `POST /api/webhooks/livekit/recording` - Receives recording webhooks from LiveKit

### Room Management

- `GET /api/rooms/waiting` - List all waiting rooms
- `GET /api/rooms/[roomId]/token/customer` - Generate customer access token
- `POST /api/rooms/[roomId]/token/agent` - Generate agent access token
- `POST /api/rooms/[roomId]/summary` - Create call summary

## 🗂️ Project Structure

```
plivo/
├── prisma/
│   └── schema.prisma              # Database schema with MongoDB models
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── plivo/
│   │   │   │   ├── sms-callback/  # Inbound SMS webhook
│   │   │   │   └── sms-status/    # SMS delivery status
│   │   │   ├── rooms/
│   │   │   │   ├── [roomId]/      # Room-specific endpoints
│   │   │   │   └── waiting/       # List waiting rooms
│   │   │   └── webhooks/
│   │   │       └── livekit/       # LiveKit webhooks
│   │   ├── agent/                 # Agent console page
│   │   ├── r/[roomId]/           # Customer video room page
│   │   └── page.tsx               # Home page
│   ├── components/
│   │   └── agent/                 # Agent-specific components
│   └── lib/
│       ├── prisma.ts              # Prisma client
│       ├── logger.ts              # Logging utility
│       ├── plivo.ts               # Plivo client wrapper
│       ├── livekit.ts             # LiveKit token generation
│       └── repositories/          # Data access layer
└── .env.local                     # Environment variables
```

## 🎨 Key Features Explained

### 1. SMS → Room Creation Flow

When a customer texts "HELP":
1. Plivo webhook triggers `/api/plivo/sms-callback`
2. System creates a new LiveKit room with 60-minute TTL
3. Generates ephemeral customer token (10-minute expiry)
4. Sends SMS reply with magic link containing the token
5. Logs both inbound and outbound SMS receipts

### 2. Token Security

- **Customer tokens**: 10-minute expiry, single-use preferred
- **Agent tokens**: Longer expiry for flexibility
- Tokens include room name and user identity
- Metadata stores role information

### 3. Real-time Room Updates

- Agent console polls `/api/rooms/waiting` every 5 seconds using SWR
- Expired rooms automatically filtered out
- Room status updates when agent joins

### 4. Call Quality Monitoring

- Connection quality indicator shows excellent/good/poor/lost
- Call timer tracks duration from join to disconnect
- Quality metrics can be stored in call summary

### 5. Recording Integration

- Rooms can enable automatic recording
- Recording status tracked in database
- Webhook updates recording metadata
- URLs stored with call summaries

## 🐛 Blockers & Solutions

### Blocker 1: LiveKit Styles Import

**Issue**: TypeScript couldn't find module declarations for `@livekit/components-styles`

**Solution**: 
- Removed direct style imports from component files
- Added styles import to main layout file
- Used proper path: `@livekit/components-styles/prefabs`

### Blocker 2: Prisma with MongoDB

**Issue**: MongoDB requires specific ObjectId handling

**Solution**:
- Used `@db.ObjectId` annotations in schema
- Separate `id` field mapped to `_id`
- Proper relationship definitions with `@relation`

### Blocker 3: Next.js App Router with Dynamic Routes

**Issue**: Params are now promises in Next.js 15+

**Solution**:
- Await params in route handlers: `const { roomId } = await params`
- Updated all dynamic route handlers accordingly

### Blocker 4: Connection Quality Hook Type

**Issue**: `useConnectionQualityIndicator()` returns object, not string

**Solution**:
- Extract quality from returned object: `quality?.quality`
- Handle undefined cases with fallback values

### Blocker 5: Environment Variables in Client Components

**Issue**: Server-side env vars not accessible in client

**Solution**:
- Use `NEXT_PUBLIC_` prefix for client-accessible vars
- Configure in `next.config.ts` for additional exposure
- Pass LiveKit URL through API responses when needed

### Blocker 6: Webhook Local Development

**Issue**: Plivo/LiveKit need public URLs for webhooks

**Solution**:
- Use ngrok or localtunnel for development
- Update webhook URLs in Plivo console
- Set `NEXT_PUBLIC_APP_URL` to tunnel URL

## 🔍 Testing

### Test SMS Flow

1. Send SMS to your Plivo number with "HELP"
2. Check logs for webhook receipt
3. Verify SMS reply was sent
4. Test the magic link in browser

### Test Agent Console

1. Create a test room by sending SMS
2. Navigate to `/agent`
3. Verify room appears in list
4. Test joining as agent

### Test Recording (if configured)

1. Complete a video call
2. Check database for recording entry
3. Verify webhook received
4. Check recording URL is stored

## 📊 Monitoring

The system logs key events:

- SMS received/sent
- Room created/joined/ended
- Token generation
- Recording status changes
- API errors

Check console output for structured logs with timestamps and context.

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables Checklist

- [ ] Set all Plivo credentials
- [ ] Set all LiveKit credentials
- [ ] Set MongoDB connection string
- [ ] Set `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Update Plivo webhook URLs to production

### Post-Deployment

1. Update Plivo webhook URLs to production domain
2. Test SMS flow end-to-end
3. Verify agent console accessibility
4. Test recording webhook (if configured)

## 🔐 Security Considerations

1. **Webhook Validation**: Consider adding Plivo signature validation
2. **Agent Authentication**: Add auth layer for `/agent` route in production
3. **Rate Limiting**: Implement rate limits on webhook endpoints
4. **Token Expiry**: Keep customer tokens short-lived
5. **CORS**: Configure appropriate CORS policies

## 📚 Additional Resources

- [Plivo SMS Documentation](https://plivo.mintlify.dev/docs/messaging/concepts/overview)
- [Plivo Webhooks](https://plivo.mintlify.dev/docs/messaging/concepts/callbacks)
- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit Quickstarts](https://docs.livekit.io/home/quickstarts/)
- [Prisma MongoDB Guide](https://www.prisma.io/docs/concepts/database-connectors/mongodb)

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

**Built with ❤️ using Next.js, Prisma, MongoDB, Plivo, and LiveKit**
