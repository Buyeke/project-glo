# Project GLO - Technical Architecture Overview

## System Overview

Project GLO is a full-stack trauma-informed support platform designed for vulnerable populations in Kenya, with multilingual support (English, Swahili, Sheng) and AI-powered assistance.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  React + TypeScript + Tailwind CSS (Progressive Web App)    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─── Authentication (Supabase Auth)
                            ├─── Real-time Updates (WebSockets)
                            └─── REST API Calls
                            │
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                           │
│                   Supabase Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │ Edge Functions│  │   Storage    │      │
│  │   Database   │  │   (Deno)     │  │   Buckets    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─── OpenAI API (AI Processing)
                            ├─── PayPal API (Donations)
                            ├─── ElevenLabs (Text-to-Speech)
                            └─── Google Calendar (Scheduling)
```

## Core Components

### 1. Frontend Architecture

**Technology Stack:**
- React 18.3.1 (UI Framework)
- TypeScript (Type Safety)
- Vite (Build Tool)
- Tailwind CSS (Styling)
- React Query (Data Fetching)
- React Router (Navigation)

**Key Features:**
- Progressive Web App (PWA) capabilities
- Offline support with service workers
- Responsive design (mobile-first)
- Accessibility compliant (WCAG 2.1)

### 2. Backend Services

**Supabase Infrastructure:**
- PostgreSQL Database (Data persistence)
- Row-Level Security (RLS) for data protection
- Real-time subscriptions
- Edge Functions (Serverless compute)
- Storage buckets (File management)
- Built-in authentication

**Edge Functions:**
- `ai-chat-processor` - AI conversation processing
- `search-knowledge` - Knowledge base queries
- `text-to-speech` - Audio generation
- `voice-to-text` - Speech recognition
- `process-paypal-payment` - Payment processing
- `paypal-webhook` - Payment notifications
- `google-calendar-sync` - Appointment scheduling
- `rate-limit-check` - Security throttling

### 3. AI Chatbot System

```
User Input → Language Detection → Intent Matching → Knowledge Search
                                         ↓
    Response Generation ← AI Processing ← Context Building
                                         ↓
              Translation → Output (Text/Speech)
```

**Components:**
- Language detection (franc library)
- Intent matching engine
- Knowledge base search
- OpenAI GPT integration
- Cultural response adaptation
- Sheng language support

### 4. Security Architecture

**Multi-Layer Security:**
1. Row-Level Security (RLS) on all tables
2. CSRF protection
3. Rate limiting
4. Input validation (Zod schemas)
5. Security logging
6. Admin access controls

**Authentication Flow:**
```
User Login → Supabase Auth → JWT Token → RLS Policies → Data Access
```

### 5. Data Flow

**User Registration:**
```
Sign Up → Email Verification → Profile Creation → Dashboard Access
```

**Service Request:**
```
User Input → Assessment → Matching Algorithm → Provider Notification
           → Provider Response → Appointment Booking
```

**Chat Interaction:**
```
Message → Language Detection → Intent Matching → AI Processing
        → Knowledge Search → Response Generation → Translation
        → Audio Output (optional)
```

## Database Architecture

**Core Tables:**
- `profiles` - User information
- `services` - Available services
- `service_requests_tracking` - Request management
- `user_assessments` - Needs assessment
- `match_logs` - Service matching
- `chat_interactions` - Conversation history
- `chatbot_intents` - Intent patterns
- `knowledge_base` - Support content

## Integration Points

### External APIs:
1. **OpenAI API** - AI chat processing
2. **PayPal API** - Payment processing
3. **Google Calendar API** - Appointment scheduling
4. **ElevenLabs API** - Text-to-speech conversion

### Internal Services:
1. **Supabase Auth** - User authentication
2. **Supabase Storage** - File management
3. **Supabase Realtime** - Live updates

## Performance Optimization

1. **Code Splitting** - Route-based lazy loading
2. **Image Optimization** - Lazy loading, WebP format
3. **Caching** - React Query with stale-time
4. **Database Indexing** - Optimized queries
5. **Edge Functions** - Geographic distribution

## Scalability

**Horizontal Scaling:**
- Serverless edge functions auto-scale
- Supabase handles database scaling
- CDN distribution for static assets

**Vertical Scaling:**
- Database can upgrade tiers
- Storage auto-scales
- Edge function concurrency increases

## Monitoring & Analytics

1. **Security Logs** - All security events
2. **Usage Stats** - User activity tracking
3. **Performance Metrics** - Response times
4. **Error Tracking** - Console logs
5. **Admin Reports** - Weekly summaries

## Deployment Architecture

```
GitHub Repository → Lovable Platform → Build & Deploy
                                      ↓
                            Production Environment
                            (lovable.app domain)
                                      ↓
                            Custom Domain (optional)
```

## Technology Decisions

### Why React?
- Component reusability
- Large ecosystem
- Strong TypeScript support
- Performance optimization

### Why Supabase?
- Open-source Firebase alternative
- PostgreSQL (robust SQL database)
- Built-in authentication
- Real-time capabilities
- Edge functions included

### Why Vite?
- Fast build times
- Hot module replacement
- Modern ES modules
- Optimized production builds

## Future Enhancements

1. **Mobile Apps** - React Native versions
2. **Additional Languages** - Mayan, others
3. **Video Consultations** - WebRTC integration
4. **AI Voice Assistant** - Real-time conversation
5. **Offline Mode** - Enhanced PWA capabilities

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-10  
**Maintained By:** Project GLO Team
