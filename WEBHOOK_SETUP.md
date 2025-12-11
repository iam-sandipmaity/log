# GitHub Webhook Setup Guide

This guide will help you configure GitHub webhooks for any repository to automatically send events to your activity log.

## Quick Setup

### Step 1: Navigate to Webhook Settings

Go to your repository's webhook settings page:
```
https://github.com/iam-sandipmaity/YOUR-REPO-NAME/settings/hooks/new
```

Or manually:
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Webhooks** (left sidebar)
4. Click **Add webhook** button

### Step 2: Configure Webhook

Fill in the following details:

#### Payload URL
```
https://log.sandipmaity.me/api/webhooks/github
```

#### Content type
Select: **application/json**

#### Secret
```
c7f2386587090ec11dbb519e4f0e1f67243a2894d3ae5e30c1cafa1254a5a403
```

#### SSL verification
Keep: **Enable SSL verification** (recommended)

### Step 3: Choose Events

Select what events should trigger this webhook:

**Option A: Send me everything** (Recommended)
- ✅ Select "Send me everything"
- This captures all repository activity automatically

**Option B: Select individual events** (Selective)
If you want specific events only, choose "Let me select individual events" and check:
- ✅ **Pushes** - Captures commits
- ✅ **Releases** - Captures version releases
- ✅ **Pull requests** - Captures PR merges
- ✅ **Issues** - Captures new issues (optional)

### Step 4: Activate

1. Make sure **Active** is checked
2. Click **Add webhook**

## Verification

After adding the webhook, GitHub will send a test "ping" event:

1. Go to the webhook you just created
2. Click on **Recent Deliveries** tab
3. You should see a ping event with response code **200**
4. If you see an error, check that:
   - URL is exactly: `https://log.sandipmaity.me/api/webhooks/github`
   - Secret matches exactly (no extra spaces)
   - Your site is deployed and accessible

## Testing

Make a test commit to verify it's working:

```bash
# In your repository
git commit --allow-empty -m "Test webhook integration"
git push
```

Within seconds, the commit should appear on [log.sandipmaity.me](https://log.sandipmaity.me)!

## Setting Up Multiple Repositories

To track multiple repositories, repeat the above steps for each repo:

1. `https://github.com/iam-sandipmaity/SnapTools/settings/hooks/new`
2. `https://github.com/iam-sandipmaity/CryptoTracker/settings/hooks/new`
3. `https://github.com/iam-sandipmaity/mftracker/settings/hooks/new`
4. And so on...

Use the **same webhook URL and secret** for all repositories.

## Troubleshooting

### Webhook shows error 500
- Check that the repository exists in your Supabase `repos` table
- Verify environment variables are set correctly on Vercel

### Events not appearing on timeline
- Check webhook delivery status on GitHub
- Verify response code is 200 or 201
- Make sure events are "approved" status (or check pending in admin)

### Private repositories
- Webhooks work for private repos automatically
- To see code diffs for private repos, ensure your `GITHUB_TOKEN` has `repo` scope

## Webhook Event Types Captured

| GitHub Event | Activity Log Type | Description |
|--------------|-------------------|-------------|
| Push | `commit` | Code commits to any branch |
| Release | `release` | New version releases |
| Pull Request (merged) | `pr_merge` | Merged pull requests |
| Issues (opened) | `issue` | New issues created |

## Security Note

The webhook secret (`c7f2386587090ec11dbb519e4f0e1f67243a2894d3ae5e30c1cafa1254a5a403`) is used to verify that requests actually come from GitHub and not malicious sources. Never share this secret publicly or commit it to public repositories.

## Questions?

- Check [README.md](./README.md) for general setup
- View [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
- Check [TROUBLESHOOTING.md](./TESTING.md) for common issues
