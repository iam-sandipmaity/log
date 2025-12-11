# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐              │
│  │  Push    │  │ Release  │  │  PR Merge    │              │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘              │
│       │             │                │                       │
│       └─────────────┴────────────────┘                       │
│                     │                                        │
│                  Webhook                                     │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Vercel / Next.js Application                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /api/webhooks/github (POST)                          │ │
│  │  ├─ Verify HMAC signature                             │ │
│  │  ├─ Parse webhook payload                             │ │
│  │  └─ Normalize event data                              │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│                       ▼                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Event Normalizer (lib/github-normalizer.ts)         │ │
│  │  ├─ Extract title, summary, body                      │ │
│  │  ├─ Auto-generate tags                                │ │
│  │  ├─ Format timestamp                                  │ │
│  │  └─ Set default status                                │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│                       ▼                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes                                            │ │
│  │  ├─ POST /api/events - Create event                   │ │
│  │  ├─ GET  /api/events - List events (with filters)     │ │
│  │  ├─ PATCH /api/events/[id] - Update event             │ │
│  │  ├─ DELETE /api/events/[id] - Delete event            │ │
│  │  ├─ GET  /api/repos - List repos                      │ │
│  │  └─ POST /api/repos - Add repo                        │ │
│  └────────────────────┬───────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                     │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │   repos table    │      │   events table   │            │
│  ├──────────────────┤      ├──────────────────┤            │
│  │ id               │◄─────┤ repo_id (FK)     │            │
│  │ name             │      │ id               │            │
│  │ url              │      │ type             │            │
│  │ icon             │      │ title            │            │
│  │ created_at       │      │ summary          │            │
│  └──────────────────┘      │ body             │            │
│                             │ timestamp        │            │
│                             │ source_url       │            │
│                             │ tags[]           │            │
│                             │ status           │            │
│                             │ pinned           │            │
│                             │ created_at       │            │
│                             │ updated_at       │            │
│                             └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Query
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Pages & Components                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Homepage (/)                                          │ │
│  │  ├─ Header                                             │ │
│  │  ├─ Hero                                               │ │
│  │  ├─ Filters (repo, type, date)                        │ │
│  │  ├─ Timeline (approved events only)                   │ │
│  │  │   └─ EventCard (×N)                                │ │
│  │  └─ Footer                                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Admin Dashboard (/admin)                             │ │
│  │  ├─ Status filters (all, pending, approved)           │ │
│  │  ├─ Event list with controls                          │ │
│  │  │   ├─ Approve/Reject buttons                        │ │
│  │  │   ├─ Pin/Unpin toggle                              │ │
│  │  │   ├─ Edit button                                   │ │
│  │  │   └─ Delete button                                 │ │
│  │  └─ Real-time updates                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ View
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        End User                              │
│                   (Browser - Desktop/Mobile)                 │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
GitHub Event → Webhook → Verify → Normalize → Store → Display
      ↓                                ↓         ↓        ↓
   Push/PR              Auto-tag   Database   Admin   Public
   Release              Extract               Review  Timeline
```

## Component Tree

```
App Layout (layout.tsx)
│
├─ Homepage (page.tsx)
│  ├─ Header
│  │  └─ Navigation Links
│  ├─ Hero
│  │  ├─ Title
│  │  └─ Subtitle
│  ├─ Filters
│  │  ├─ Repo Selector
│  │  └─ Event Type Pills
│  ├─ Timeline
│  │  └─ EventCard (×N)
│  │     ├─ Icon (based on type)
│  │     ├─ Repo Name
│  │     ├─ Event Title
│  │     ├─ Summary
│  │     ├─ Tags
│  │     ├─ Timestamp
│  │     └─ GitHub Link
│  └─ Footer
│
└─ Admin (admin/page.tsx)
   ├─ Header
   ├─ Filter Tabs
   └─ Event List
      └─ Event Row (×N)
         ├─ Status Badge
         ├─ Event Details
         └─ Action Buttons
            ├─ Approve
            ├─ Reject
            ├─ Pin
            ├─ Edit
            └─ Delete
```

## API Endpoint Flow

### Webhook Processing
```
POST /api/webhooks/github
  ↓
Verify HMAC signature
  ↓
Parse event type (push, release, pull_request)
  ↓
Normalize event data
  ↓
Check/create repository
  ↓
Insert event into database
  ↓
Return 201 Created
```

### Event Retrieval
```
GET /api/events?status=approved
  ↓
Build Supabase query
  ↓
Apply filters (repo, type, status)
  ↓
Order by pinned + timestamp
  ↓
Join with repos table
  ↓
Return JSON array
```

### Event Update
```
PATCH /api/events/[id]
  ↓
Verify admin access
  ↓
Update event fields
  ↓
Trigger updated_at timestamp
  ↓
Return updated event
```

## State Management

```
Client-Side State (React)
├─ Timeline Component
│  ├─ events[] - List of events
│  ├─ loading - Boolean
│  └─ error - Error message
│
├─ Filters Component
│  ├─ selectedRepo - String
│  ├─ selectedType - EventType
│  └─ dateRange - DateRange
│
└─ Admin Component
   ├─ events[] - All events
   ├─ filter - Status filter
   └─ loading - Boolean

Server-Side State (Supabase)
├─ repos table
└─ events table
```

## Security Layers

```
Layer 1: GitHub Webhook
├─ HMAC SHA256 signature verification
└─ Secret key validation

Layer 2: Vercel/Next.js
├─ HTTPS enforcement
├─ Environment variable protection
└─ Server-side only secrets

Layer 3: Supabase
├─ Row Level Security (RLS)
├─ Public read for approved events
├─ Admin-only write access
└─ API key authentication

Layer 4: Admin Dashboard
└─ Password protection (planned)
```

## Performance Optimizations

```
Frontend
├─ React Server Components (RSC)
├─ Automatic code splitting
├─ Image optimization (Next.js)
├─ Tailwind CSS purging
└─ Static generation where possible

Backend
├─ Database indexes on:
│  ├─ events.repo_id
│  ├─ events.timestamp
│  ├─ events.status
│  ├─ events.type
│  └─ events.pinned
├─ Efficient queries (select only needed fields)
└─ Connection pooling (Supabase)

Deployment
├─ CDN (Vercel Edge Network)
├─ Automatic caching
└─ Serverless functions
```

## Error Handling

```
Webhook Errors
├─ Invalid signature → 401 Unauthorized
├─ Parse error → 400 Bad Request
├─ Database error → 500 Internal Server Error
└─ Unknown event type → 200 OK (ignored)

API Errors
├─ Not found → 404
├─ Validation error → 400
├─ Database error → 500
└─ Unauthorized → 401

Client Errors
├─ Network error → Retry + Error message
├─ Parse error → Error boundary
└─ Component error → Error boundary
```

## Monitoring Points

```
1. Webhook Delivery
   ├─ GitHub webhook logs
   └─ Vercel function logs

2. API Performance
   ├─ Response times
   └─ Error rates

3. Database
   ├─ Query performance
   ├─ Storage usage
   └─ Connection count

4. User Experience
   ├─ Page load times
   ├─ Core Web Vitals
   └─ Error rates
```

---

This architecture provides:
- ✅ **Scalability**: Serverless functions scale automatically
- ✅ **Reliability**: Multiple layers of error handling
- ✅ **Security**: Verification at every layer
- ✅ **Performance**: Optimized queries and caching
- ✅ **Maintainability**: Clear separation of concerns
