# Repository Activity Log

A minimal, clean, professional site that automatically displays all repository changes in a friendly, visual, easy-to-understand timeline.

## Features

- **Unified Timeline**: View commits, releases, PR merges, and repository updates in one place
- **Clean UI**: Minimal design with smooth animations and hover effects
- **Smart Filtering**: Filter by repository, event type, or date range
- **Auto-Generated Summaries**: Automatic tagging and summarization of events
- **Admin Dashboard**: Moderate, edit, pin, or delete events
- **GitHub Integration**: Webhook support with polling fallback
- **Real-time Updates**: Instant display of new repository activity

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- GitHub Personal Access Token (optional, for polling)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd githublog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project on Supabase
   - Run the SQL from `supabase/schema.sql` in the Supabase SQL editor
   - Get your project URL and anon key from Project Settings > API

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GITHUB_WEBHOOK_SECRET=your_webhook_secret
   GITHUB_TOKEN=your_github_token
   ADMIN_PASSWORD=your_admin_password
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## GitHub Webhook Setup

1. Go to your repository settings on GitHub
2. Navigate to Settings > Webhooks > Add webhook
3. Set the Payload URL to: `https://your-domain.com/api/webhooks/github`
4. Set Content type to `application/json`
5. Set the Secret to match your `GITHUB_WEBHOOK_SECRET`
6. Select individual events:
   - Pushes
   - Releases
   - Pull requests
7. Make sure "Active" is checked
8. Click "Add webhook"

## Project Structure

```
githublog/
├── app/
│   ├── api/
│   │   ├── events/          # Event CRUD operations
│   │   ├── repos/           # Repository management
│   │   └── webhooks/        # GitHub webhook handler
│   ├── admin/               # Admin dashboard
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/
│   ├── EventCard.tsx        # Timeline event card
│   ├── Filters.tsx          # Filter controls
│   ├── Footer.tsx           # Page footer
│   ├── Header.tsx           # Page header
│   ├── Hero.tsx             # Hero section
│   └── Timeline.tsx         # Events timeline
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── github-normalizer.ts # Event normalization
├── supabase/
│   └── schema.sql           # Database schema
├── types/
│   └── index.ts             # TypeScript types
└── package.json
```

## Database Schema

### repos
- `id`: UUID (Primary Key)
- `name`: Text (Unique)
- `url`: Text
- `icon`: Text (Optional)
- `created_at`: Timestamp

### events
- `id`: UUID (Primary Key)
- `repo_id`: UUID (Foreign Key)
- `type`: Enum (commit, release, pr_merge, repo_update)
- `title`: Text
- `summary`: Text
- `body`: Text (Optional)
- `timestamp`: Timestamp
- `source_url`: Text
- `tags`: Array of Text
- `status`: Enum (pending, approved, rejected)
- `pinned`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

## API Endpoints

- `GET /api/events` - Fetch events (with optional filters)
- `POST /api/events` - Create a new event
- `PATCH /api/events/[id]` - Update an event
- `DELETE /api/events/[id]` - Delete an event
- `GET /api/repos` - Fetch repositories
- `POST /api/repos` - Add a repository
- `POST /api/webhooks/github` - GitHub webhook endpoint

## Admin Dashboard

Access the admin dashboard at `/admin` to:
- View all events (pending and approved)
- Approve or reject pending events
- Pin important updates
- Edit event details
- Delete events
- Manage tags and summaries

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Update GitHub Webhook URL

After deployment, update your GitHub webhook URL to point to your production domain:
```
https://your-vercel-domain.vercel.app/api/webhooks/github
```

## Customization

### Colors

Edit colors in [tailwind.config.ts](tailwind.config.ts):

```typescript
colors: {
  background: '#ffffff',
  foreground: '#111111',
  accent: '#0f62fe',
}
```

### Event Types

Add or modify event types in [types/index.ts](types/index.ts) and update the normalizer accordingly.

### Tags

Customize auto-tagging logic in [lib/github-normalizer.ts](lib/github-normalizer.ts).

## License

MIT License - feel free to use this project for your own activity log!

## Author

**Sandip Maity**
- Website: [sandipmaity.me](https://sandipmaity.me)
- GitHub: [@sandipmaity](https://github.com/sandipmaity)

---

Auto-generated development log powered by GitHub webhooks and Next.js.
