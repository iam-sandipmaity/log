# Webhook Testing Guide

This guide helps you test the webhook functionality locally or in production.

## Testing Locally

### 1. Use ngrok for local testing

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, expose port 3000
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and use it in your GitHub webhook settings:
```
https://abc123.ngrok.io/api/webhooks/github
```

### 2. Test with curl

You can manually send webhook payloads for testing:

```bash
# Test push event
curl -X POST http://localhost:3000/api/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d @test/payloads/push.json
```

## Sample Webhook Payloads

### Push Event (Commit)

```json
{
  "ref": "refs/heads/main",
  "repository": {
    "id": 123456789,
    "name": "my-repo",
    "full_name": "username/my-repo",
    "html_url": "https://github.com/username/my-repo",
    "owner": {
      "login": "username",
      "avatar_url": "https://avatars.githubusercontent.com/u/123456"
    }
  },
  "commits": [
    {
      "id": "abc123def456",
      "message": "Fix navigation bug on mobile devices\n\nResolved issue where menu was not properly displayed on smaller screens.",
      "timestamp": "2024-01-15T10:30:00Z",
      "url": "https://github.com/username/my-repo/commit/abc123def456",
      "author": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "compare": "https://github.com/username/my-repo/compare/abc123...def456"
}
```

### Release Event

```json
{
  "action": "published",
  "release": {
    "tag_name": "v1.0.0",
    "name": "Version 1.0.0 - Initial Release",
    "body": "## What's New\n\n- Added user authentication\n- Implemented dashboard\n- Fixed performance issues\n\n## Breaking Changes\n\n- API endpoint structure has changed",
    "html_url": "https://github.com/username/my-repo/releases/tag/v1.0.0",
    "published_at": "2024-01-15T10:30:00Z",
    "author": {
      "login": "username"
    }
  },
  "repository": {
    "id": 123456789,
    "name": "my-repo",
    "full_name": "username/my-repo",
    "html_url": "https://github.com/username/my-repo",
    "owner": {
      "login": "username",
      "avatar_url": "https://avatars.githubusercontent.com/u/123456"
    }
  }
}
```

### Pull Request Merge Event

```json
{
  "action": "closed",
  "pull_request": {
    "number": 42,
    "title": "Add search functionality",
    "body": "This PR adds a search feature to the application.\n\n## Changes\n- Added search bar component\n- Implemented search API\n- Added tests",
    "html_url": "https://github.com/username/my-repo/pull/42",
    "merged": true,
    "merged_at": "2024-01-15T10:30:00Z",
    "user": {
      "login": "contributor"
    }
  },
  "repository": {
    "id": 123456789,
    "name": "my-repo",
    "full_name": "username/my-repo",
    "html_url": "https://github.com/username/my-repo",
    "owner": {
      "login": "username",
      "avatar_url": "https://avatars.githubusercontent.com/u/123456"
    }
  }
}
```

## Testing with GitHub CLI

Install GitHub CLI and trigger webhook redelivery:

```bash
# Install gh
# https://cli.github.com/

# List webhooks
gh api repos/username/repo/hooks

# Get webhook ID and redeliver
gh api repos/username/repo/hooks/HOOK_ID/deliveries
gh api -X POST repos/username/repo/hooks/HOOK_ID/deliveries/DELIVERY_ID/attempts
```

## Manual API Testing

### Create Event Manually

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "repo_id": "your-repo-uuid",
    "type": "commit",
    "title": "Test commit",
    "summary": "This is a test event",
    "timestamp": "2024-01-15T10:30:00Z",
    "source_url": "https://github.com/username/repo",
    "tags": ["test"],
    "status": "approved",
    "pinned": false
  }'
```

### Get Events

```bash
# Get all approved events
curl http://localhost:3000/api/events

# Get events for specific repo
curl "http://localhost:3000/api/events?repo=repo-uuid"

# Get events of specific type
curl "http://localhost:3000/api/events?type=release"
```

### Update Event

```bash
curl -X PATCH http://localhost:3000/api/events/EVENT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "pinned": true,
    "tags": ["release", "important"]
  }'
```

### Delete Event

```bash
curl -X DELETE http://localhost:3000/api/events/EVENT_ID
```

## Verifying Webhook Signature

The webhook handler verifies GitHub signatures. To test this:

```bash
# Generate HMAC signature
SECRET="your-webhook-secret"
PAYLOAD='{"test": "data"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# Send with signature
curl -X POST http://localhost:3000/api/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -d "$PAYLOAD"
```

## Expected Responses

### Successful Webhook
```json
{
  "success": true
}
```
Status: 201 Created

### Invalid Signature
```json
{
  "error": "Invalid signature"
}
```
Status: 401 Unauthorized

### Unsupported Event
```json
{
  "message": "Event type not supported"
}
```
Status: 200 OK

### Database Error
```json
{
  "error": "Failed to create event"
}
```
Status: 500 Internal Server Error

## Debugging Tips

### Check Vercel Logs
```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs [deployment-url]
```

### Check Supabase Logs
Go to Supabase Dashboard > Database > Logs

### Check GitHub Webhook Deliveries
1. Go to repository Settings > Webhooks
2. Click on your webhook
3. Scroll to "Recent Deliveries"
4. Click on a delivery to see:
   - Request headers
   - Request payload
   - Response status
   - Response body

### Enable Debug Logging

Add console.logs to webhook handler:

```typescript
// app/api/webhooks/github/route.ts
export async function POST(request: Request) {
  console.log('Webhook received')
  const body = await request.text()
  console.log('Payload:', body)
  
  // ... rest of code
  
  console.log('Event created successfully')
  return NextResponse.json({ success: true })
}
```

## Common Issues

### Webhook Not Firing
- ✅ Check webhook is active in GitHub
- ✅ Verify URL is correct
- ✅ Ensure events are selected (push, release, pull_request)
- ✅ Check Recent Deliveries for errors

### Events Not Appearing
- ✅ Check event status (might be pending)
- ✅ Visit /admin to see all events
- ✅ Verify database connection
- ✅ Check console for errors

### Signature Verification Failed
- ✅ Ensure GITHUB_WEBHOOK_SECRET matches GitHub webhook secret
- ✅ Check for extra whitespace in environment variable
- ✅ Verify secret is set in production

### Timeout Errors
- ✅ Check Supabase connection
- ✅ Verify database isn't overloaded
- ✅ Check for slow queries

## Testing Checklist

Before going live, test:

- [ ] Push commits (single and multiple)
- [ ] Create releases
- [ ] Merge pull requests
- [ ] Events appear on timeline
- [ ] Filters work correctly
- [ ] Admin dashboard functions
- [ ] Approve/reject works
- [ ] Pin/unpin works
- [ ] Edit events works
- [ ] Delete events works
- [ ] Mobile responsive design
- [ ] GitHub links work
- [ ] Webhook signature verification
- [ ] Error handling

## Load Testing

Test with multiple rapid events:

```bash
# Send 10 events quickly
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/events \
    -H "Content-Type: application/json" \
    -d "{...event data...}" &
done
wait
```

---

Happy testing! 🧪
