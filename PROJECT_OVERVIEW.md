# log.sandipmaity.me - Project Overview

## 🎯 What is this?

A **minimal, auto-updating development activity log** that displays all your GitHub repository changes in a clean, unified timeline. Think of it as a beautiful, automated changelog for all your projects.

## ✨ Key Features

### For Visitors
- **Unified Timeline** - See commits, releases, PRs, and updates all in one place
- **Detailed Event View** - Click any event to see complete commit details
- **Code Diff Viewer** - GitHub-style diffs with syntax highlighting for all file changes
- **Smart Filtering** - Filter by repo, event type, or date
- **Clean Design** - Minimal, professional UI matching sandipmaity.me style
- **Auto-Generated** - No manual updates needed
- **Mobile Responsive** - Perfect on any device

### For You (Admin)
- **Easy Moderation** - Approve, edit, or delete incoming events
- **Pin Important Updates** - Highlight key releases or features
- **Tag Management** - Auto-tagging with manual override
- **Event Editing** - Modify titles, summaries, and descriptions

## 🏗️ Architecture

```
GitHub Push/Release/PR
         ↓
    Webhook → API → Database
         ↓              ↓
    Normalize      Store Event
         ↓              ↓
    Auto-Tag      Admin Review
         ↓              ↓
              Public Timeline
```

## 📦 Tech Stack

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (recommended)
- **Icons**: Lucide React

## 🎨 Design Language

**Theme**: Minimal, sharp, developer-focused

**Colors**:
- Background: `#ffffff` (white)
- Text: `#111111` (near black)
- Accent: `#0f62fe` (IBM blue)

**Typography**: System fonts (-apple-system, Segoe UI, etc.)

**Layout**:
- Left-aligned content
- Generous whitespace
- Subtle hover effects
- Smooth animations

## 📊 Data Model

### Repos Table
```
- id (UUID)
- name (text, unique)
- url (text)
- icon (text, optional)
- created_at (timestamp)
```

### Events Table
```
- id (UUID)
- repo_id (UUID, FK)
- type (enum: commit, release, pr_merge, repo_update)
- title (text)
- summary (text)
- body (text, optional)
- timestamp (timestamp)
- source_url (text)
- tags (text array)
- status (enum: pending, approved, rejected)
- pinned (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🔄 Event Flow

### 1. GitHub Webhook Fires
When you push code, create a release, or merge a PR, GitHub sends a webhook to your app.

### 2. Event Normalization
The webhook handler:
- Extracts relevant information
- Creates a clean summary
- Auto-generates tags (fix, feature, docs, etc.)
- Stores in database with status "approved" (or "pending" if you enable moderation)

### 3. Display on Timeline
Approved events appear on the public timeline at `/`, sorted by:
1. Pinned status (pinned first)
2. Timestamp (newest first)

### 4. Admin Management
Visit `/admin` to:
- Review pending events
- Pin important updates
- Edit summaries and titles
- Add or remove tags
- Delete unwanted events

## 🎯 Event Types

### Commits
- **Icon**: Git commit icon
- **Color**: Blue
- **Triggers**: Push to any branch
- **Auto-tags**: Extracted from commit messages

### Releases
- **Icon**: Tag icon
- **Color**: Green
- **Triggers**: Published release
- **Auto-tags**: Always includes "release"
- **Default**: Pinned automatically

### PR Merges
- **Icon**: Pull request icon
- **Color**: Purple
- **Triggers**: Closed + merged PR
- **Auto-tags**: Extracted from PR title/body

### Repo Updates
- **Icon**: Settings icon
- **Color**: Orange
- **Triggers**: Manual or custom webhooks
- **Auto-tags**: Based on description

## 🏷️ Auto-Tagging

Events are automatically tagged based on keywords:

| Keyword | Tag |
|---------|-----|
| fix, bug | `fix` |
| feat, feature | `feature` |
| docs, documentation | `docs` |
| refactor | `refactor` |
| test, testing | `test` |
| chore | `chore` |
| perf, performance | `performance` |
| style | `style` |
| security | `security` |

## 📱 Pages

### Home (/)
- Hero section with title and subtitle
- Filter controls (repo, type, date)
- Timeline of event cards
- Footer with copyright

### Admin (/admin)
- Status filters (all, pending, approved)
- Event list with action buttons
- Approve/reject controls
- Pin/unpin toggle
- Edit and delete buttons

## 🚀 Quick Start

1. **Set up Supabase**
   ```sql
   -- Run supabase/schema.sql in Supabase SQL editor
   -- Optionally run supabase/seed.sql for test data
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit with your Supabase credentials
   ```

3. **Install and run**
   ```bash
   npm install
   npm run dev
   ```

4. **Configure webhooks**
   - Add webhook in GitHub repo settings
   - Point to: `https://your-domain.com/api/webhooks/github`
   - Select events: Pushes, Releases, Pull requests

## 🎬 Demo Flow

1. Push code to a tracked repository
2. GitHub sends webhook to your app
3. Event is normalized and stored
4. Event appears on timeline immediately
5. Visit `/admin` to pin, edit, or manage
6. Changes reflect instantly on public timeline

## 🔐 Security

- **Webhook Verification**: HMAC SHA256 signature verification
- **Database Security**: Supabase Row Level Security (RLS)
- **Admin Access**: Password-protected admin dashboard
- **Environment Variables**: All secrets in .env.local

## 🎨 Animations

- **Fade-up**: Timeline cards fade in and slide up on page load
- **Hover lift**: Cards slightly lift on hover with border color change
- **Smooth transitions**: All color and transform changes are smoothly animated

## 📈 Future Enhancements

Possible additions:
- [ ] Search functionality
- [ ] RSS feed
- [ ] Email notifications for new events
- [ ] GitHub polling fallback for missed webhooks
- [ ] Event analytics and stats
- [ ] Multi-user admin support
- [ ] Custom event types
- [ ] Markdown support in event bodies
- [ ] Export to JSON/CSV

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use!

## 📄 License

MIT - Use it however you like!

---

Built with ❤️ by Sandip Maity
