# Deployment Checklist

Use this checklist when deploying log.sandipmaity.me to production.

## Pre-Deployment

### 1. Database Setup
- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Run `supabase/schema.sql` in Supabase SQL Editor
- [ ] Note down Supabase URL and keys from Project Settings > API
- [ ] (Optional) Run `supabase/seed.sql` for test data

### 2. Environment Configuration
- [ ] Generate webhook secret: `openssl rand -hex 32`
- [ ] Create GitHub Personal Access Token (if using polling)
- [ ] Choose admin password
- [ ] Prepare all environment variables

### 3. Code Preparation
- [ ] Update links in Header component (sandipmaity.me, GitHub, email)
- [ ] Verify colors in `tailwind.config.ts` match your brand
- [ ] Test build locally: `npm run build`
- [ ] Check for linting errors: `npm run lint`
- [ ] Commit and push all changes

## Vercel Deployment

### 1. Initial Deploy
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click "Add New Project"
- [ ] Import your GitHub repository
- [ ] Configure project:
  - Framework Preset: Next.js
  - Root Directory: ./
  - Build Command: `npm run build`
  - Output Directory: `.next`

### 2. Environment Variables
Add these in Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_TOKEN=ghp_xxx (optional)
ADMIN_PASSWORD=your-secure-password
```

- [ ] Add all environment variables
- [ ] Mark which environments (Production, Preview, Development)
- [ ] Save changes

### 3. Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Note your deployment URL (e.g., `githublog.vercel.app`)
- [ ] Test the deployed site

## Post-Deployment

### 1. Verify Deployment
- [ ] Visit homepage - check timeline loads
- [ ] Test filters
- [ ] Check responsive design on mobile
- [ ] Visit `/admin` - verify it loads
- [ ] Check all navigation links work

### 2. GitHub Webhook Setup

For **each** repository you want to track:

- [ ] Go to GitHub repo > Settings > Webhooks
- [ ] Click "Add webhook"
- [ ] Configure webhook:
  ```
  Payload URL: https://your-domain.vercel.app/api/webhooks/github
  Content type: application/json
  Secret: [your GITHUB_WEBHOOK_SECRET]
  ```
- [ ] Select events to trigger:
  - [x] Pushes
  - [x] Releases  
  - [x] Pull requests
- [ ] Ensure "Active" is checked
- [ ] Click "Add webhook"
- [ ] Test webhook by clicking "Recent Deliveries" > "Redeliver"

### 3. Test End-to-End

- [ ] Push a commit to tracked repo
- [ ] Check webhook delivery in GitHub (should be green checkmark)
- [ ] Verify event appears in your timeline
- [ ] Check event formatting and links
- [ ] Test admin dashboard:
  - [ ] View pending events (if moderation enabled)
  - [ ] Approve/reject events
  - [ ] Pin an event
  - [ ] Edit an event
  - [ ] Delete an event

### 4. Custom Domain (Optional)

If using custom domain (e.g., log.sandipmaity.me):

- [ ] Add domain in Vercel Dashboard > Settings > Domains
- [ ] Update DNS records:
  ```
  Type: CNAME
  Name: log
  Value: cname.vercel-dns.com
  ```
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Update GitHub webhooks to use new domain
- [ ] Test with new domain

## Monitoring

### Daily Checks
- [ ] Check Vercel deployment status
- [ ] Monitor webhook deliveries in GitHub
- [ ] Review events appearing on timeline

### Weekly Checks
- [ ] Review Vercel logs for errors
- [ ] Check Supabase database storage
- [ ] Update dependencies if needed: `npm update`

### Monthly Checks
- [ ] Review and clean up old events if needed
- [ ] Check for Next.js updates
- [ ] Update documentation if features added

## Troubleshooting

### Webhook Not Working
1. Check Vercel logs: `https://vercel.com/[your-project]/logs`
2. Verify webhook secret matches
3. Check webhook delivery in GitHub settings
4. Ensure endpoint is public (not behind auth)

### Events Not Appearing
1. Check event status (might be pending)
2. Visit `/admin` to see all events
3. Verify Supabase connection
4. Check RLS policies in Supabase

### Build Failures
1. Check environment variables are set
2. Review build logs in Vercel
3. Test locally: `npm run build`
4. Check for TypeScript errors

### Database Issues
1. Verify Supabase credentials
2. Check database connection in Supabase dashboard
3. Review RLS policies
4. Check API logs

## Security Checklist

- [ ] Webhook secret is strong and unique
- [ ] Admin password is secure
- [ ] Service role key is not exposed in client code
- [ ] Environment variables are properly set
- [ ] RLS policies are enabled in Supabase
- [ ] HTTPS is enforced (automatic with Vercel)

## Performance Optimization

- [ ] Enable Vercel Analytics (optional)
- [ ] Set up caching headers if needed
- [ ] Monitor Core Web Vitals
- [ ] Optimize images if added later
- [ ] Consider CDN for static assets

## Backup Strategy

- [ ] Export Supabase database regularly
- [ ] Keep backups of environment variables
- [ ] Document any custom configurations
- [ ] Version control all code changes

## Done! 🎉

Your activity log is now live and automatically tracking your GitHub activity!

## Quick Reference

- **Homepage**: `https://your-domain.vercel.app`
- **Admin**: `https://your-domain.vercel.app/admin`
- **Webhook URL**: `https://your-domain.vercel.app/api/webhooks/github`
- **Vercel Dashboard**: `https://vercel.com/your-project`
- **Supabase Dashboard**: `https://app.supabase.com/project/your-project`

---

Need help? Check the [README.md](README.md) or [SETUP.md](SETUP.md) for detailed instructions.
