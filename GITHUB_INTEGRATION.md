# GitHub Integration Details

## How Commit Details Are Displayed

Your GitHubLog application has two levels of commit information display:

### 1. **Timeline View (Homepage)**
- Shows commit title/summary
- Displays tags and repository name
- Shows relative timestamp
- **NOW SHOWS**: Commit SHA (first 7 characters) for commits, PR/Issue numbers

### 2. **Event Detail Page** (Click on any event)
Requires a **GitHub Personal Access Token** to fetch and display:
- **Full commit SHA** with link to GitHub
- **Individual commits** (for multi-commit pushes)
- **Commit author** and timestamp
- **Files changed** with statistics
- **Code diffs** (additions/deletions)
- **Line-by-line changes** with syntax highlighting

## Why You're Not Seeing Full Commit Details

The commit details **require a GitHub Personal Access Token** because:

1. The timeline only stores summary information from webhooks
2. Full commit details (diffs, file changes, etc.) are fetched on-demand from GitHub's API
3. GitHub's API requires authentication for most requests

## How to Enable Full Commit Details

### Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens/new)
2. Click "Generate new token" (classic)
3. Give it a descriptive name: `GitHubLog App`
4. Set expiration (recommended: 90 days or longer)
5. Select scopes:
   - ✅ `repo` (for private repos)
   - OR ✅ `public_repo` (if only tracking public repos)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)

### Step 2: Add Token to Environment

1. Open your `.env.local` file
2. Update the `GITHUB_TOKEN` line:
   ```env
   GITHUB_TOKEN=ghp_YourActualTokenHere
   ```
3. Save the file
4. Restart your dev server: `npm run dev`

### Step 3: Test It

1. Open your app at `http://localhost:3000`
2. Click on any commit event
3. You should now see:
   - Commit statistics (files changed, additions, deletions)
   - List of all commits (for multi-commit pushes)
   - Individual file changes with diffs
   - Syntax-highlighted code changes

## What's Stored in the Database vs Fetched Live

### Stored in Database (from webhooks):
- Event title
- Summary/description
- Timestamp
- Tags
- Repository information
- Source URL (link to GitHub)

### Fetched Live from GitHub API (requires token):
- Commit SHAs
- Author details
- File-by-file changes
- Code diffs
- Addition/deletion counts

## Troubleshooting

### "Event details not loading"
- Check that `GITHUB_TOKEN` is set in `.env.local`
- Verify the token has `repo` or `public_repo` scope
- Check server logs for authentication errors

### "Unauthorized" errors
- Token may be expired
- Token may not have required permissions
- Generate a new token with correct scopes

### Token Security
- ✅ DO: Keep tokens in `.env.local` (already in `.gitignore`)
- ✅ DO: Use environment variables in production
- ❌ DON'T: Commit tokens to git
- ❌ DON'T: Share tokens publicly

## Example: What You'll See

### Without Token (Timeline Only):
```
✓ Commit: Fix authentication bug
  📅 2 hours ago • Jan 19, 2026
  🏷️ fix, security
```

### With Token (Detail Page):
```
✓ Commit: Fix authentication bug
  📅 2 hours ago • Jan 19, 2026
  🏷️ fix, security

📊 Changes:
  1 Commit | 3 Files Changed | +45 | -12

📝 Commits:
  abc1234 - Fix authentication bug (@username)

📁 Files Changed:
  src/auth.ts           +25 -8
  tests/auth.test.ts    +15 -2
  README.md             +5  -2

[Shows full code diffs with syntax highlighting]
```

## Need Help?

If you're still not seeing commit details after adding the token:
1. Check the server console for error messages
2. Verify your token at: https://github.com/settings/tokens
3. Ensure the token hasn't expired
4. Try generating a new token with `repo` scope
