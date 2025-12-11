# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Run the contents of `supabase/schema.sql`
4. Optionally run `supabase/seed.sql` for sample data

### 3. Configure Environment Variables

Copy the example file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Get these from Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Generate a random secret for webhook verification
GITHUB_WEBHOOK_SECRET=your-random-secret

# Optional: GitHub Personal Access Token for polling
GITHUB_TOKEN=ghp_your_token

# Set a password for admin access
ADMIN_PASSWORD=your-secure-password
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Set up GitHub Webhooks

For each repository you want to track:

1. Go to repository Settings > Webhooks > Add webhook
2. Payload URL: `https://your-domain.com/api/webhooks/github`
3. Content type: `application/json`
4. Secret: Same as your `GITHUB_WEBHOOK_SECRET`
5. Events: Select "Pushes", "Releases", and "Pull requests"
6. Active: ✓
7. Click "Add webhook"

## Project Structure

```
githublog/
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   │   ├── events/      # Event management
│   │   ├── repos/       # Repository management
│   │   └── webhooks/    # GitHub webhook handler
│   ├── admin/           # Admin dashboard
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── EventCard.tsx   # Timeline event card
│   ├── Filters.tsx     # Filter controls
│   ├── Footer.tsx      # Page footer
│   ├── Header.tsx      # Page header
│   ├── Hero.tsx        # Hero section
│   └── Timeline.tsx    # Events timeline
├── lib/                # Utility functions
│   ├── supabase.ts     # Supabase client
│   └── github-normalizer.ts  # Event normalization
├── supabase/           # Database files
│   ├── schema.sql      # Database schema
│   └── seed.sql        # Sample data
└── types/              # TypeScript types
    └── index.ts
```

## Features

### Public Timeline (/)
- View all approved events in chronological order
- Filter by repository, event type
- Responsive card design with hover effects
- Direct links to GitHub

### Admin Dashboard (/admin)
- View pending and approved events
- Approve/reject pending events
- Pin important updates
- Edit event details
- Delete events
- Tag management

### API Endpoints

- `GET /api/events` - Fetch events
  - Query params: `?repo=id&type=commit&status=approved`
- `POST /api/events` - Create event (webhook/manual)
- `PATCH /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event
- `GET /api/repos` - List repositories
- `POST /api/repos` - Add repository
- `POST /api/webhooks/github` - GitHub webhook endpoint

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Post-Deployment

1. Update webhook URLs in GitHub to point to your production domain
2. Test webhooks by pushing a commit
3. Check Vercel logs if issues occur

## Customization

### Change Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  background: '#ffffff',
  foreground: '#111111',
  accent: '#0f62fe',  // Change this
}
```

### Add Event Types
1. Update `EventType` in `types/index.ts`
2. Add icon mapping in `components/EventCard.tsx`
3. Update `normalizeGitHubEvent` in `lib/github-normalizer.ts`

### Modify Auto-Tagging
Edit `extractTags` function in `lib/github-normalizer.ts`

## Troubleshooting

### Build fails
- Ensure all environment variables are set
- Check Supabase credentials
- Run `npm install` again

### Webhooks not working
- Verify webhook secret matches
- Check Vercel logs
- Test webhook delivery in GitHub settings

### Events not appearing
- Check event status (might be pending)
- Go to `/admin` to approve pending events
- Verify Supabase RLS policies

## Development

### Run locally
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## License

MIT
