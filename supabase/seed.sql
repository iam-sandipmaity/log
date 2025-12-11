-- Production seed data for log.sandipmaity.me
-- Run this after schema.sql to initialize your activity log

-- Insert all your repositories
INSERT INTO repos (name, url, icon) VALUES
  ('iam-sandipmaity/SnapTools', 'https://github.com/iam-sandipmaity/SnapTools', 'https://avatars.githubusercontent.com/u/iam-sandipmaity'),
  ('iam-sandipmaity/CryptoTracker', 'https://github.com/iam-sandipmaity/CryptoTracker', 'https://avatars.githubusercontent.com/u/iam-sandipmaity'),
  ('iam-sandipmaity/mftracker', 'https://github.com/iam-sandipmaity/mftracker', 'https://avatars.githubusercontent.com/u/iam-sandipmaity'),
  ('iam-sandipmaity/WeatherWise', 'https://github.com/iam-sandipmaity/WeatherWise', 'https://avatars.githubusercontent.com/u/iam-sandipmaity'),
  ('iam-sandipmaity/sandip', 'https://github.com/iam-sandipmaity/sandip', 'https://avatars.githubusercontent.com/u/iam-sandipmaity'),
  ('iam-sandipmaity/weather', 'https://github.com/iam-sandipmaity/weather', 'https://avatars.githubusercontent.com/u/iam-sandipmaity'),
  ('iam-sandipmaity/download', 'https://github.com/iam-sandipmaity/download', 'https://avatars.githubusercontent.com/u/iam-sandipmaity'),
  ('iam-sandipmaity/newportfolio', 'https://github.com/iam-sandipmaity/newportfolio', 'https://avatars.githubusercontent.com/u/iam-sandipmaity')
ON CONFLICT (name) DO NOTHING;

-- Note: No sample events inserted
-- Real events will be automatically created by GitHub webhooks
-- To add a welcome message, use the admin dashboard after deployment



-- -- Sample data for testing (run this after schema.sql)

-- -- Insert sample repositories
-- INSERT INTO repos (name, url, icon) VALUES
--   ('sandipmaity/portfolio', 'https://github.com/sandipmaity/portfolio', 'https://avatars.githubusercontent.com/u/example'),
--   ('sandipmaity/blog', 'https://github.com/sandipmaity/blog', 'https://avatars.githubusercontent.com/u/example')
-- ON CONFLICT (name) DO NOTHING;

-- -- Insert sample events
-- INSERT INTO events (repo_id, type, title, summary, body, timestamp, source_url, tags, status, pinned)
-- SELECT 
--   r.id,
--   'release',
--   'Release v1.0.0: Initial Launch',
--   'First major release with core features including responsive design, dark mode, and optimized performance.',
--   'This is the initial release of the portfolio website. Features include: responsive layout, dark mode support, project showcase, blog integration, and contact form.',
--   NOW() - INTERVAL '2 days',
--   'https://github.com/sandipmaity/portfolio/releases/tag/v1.0.0',
--   ARRAY['release', 'feature'],
--   'approved',
--   true
-- FROM repos r WHERE r.name = 'sandipmaity/portfolio'
-- ON CONFLICT DO NOTHING;

-- INSERT INTO events (repo_id, type, title, summary, body, timestamp, source_url, tags, status, pinned)
-- SELECT 
--   r.id,
--   'commit',
--   'Fix responsive layout on mobile devices',
--   'Fixed mobile navigation menu and improved touch interactions',
--   'Updated CSS media queries and added touch-friendly navigation. This resolves the issue where the menu was not properly displayed on smaller screens.',
--   NOW() - INTERVAL '1 day',
--   'https://github.com/sandipmaity/portfolio/commit/abc123',
--   ARRAY['fix'],
--   'approved',
--   false
-- FROM repos r WHERE r.name = 'sandipmaity/portfolio'
-- ON CONFLICT DO NOTHING;

-- INSERT INTO events (repo_id, type, title, summary, body, timestamp, source_url, tags, status, pinned)
-- SELECT 
--   r.id,
--   'pr_merge',
--   'PR #15: Add new blog post about TypeScript best practices',
--   'Added comprehensive guide on TypeScript best practices with code examples',
--   'This PR adds a new blog post covering TypeScript best practices including type safety, interfaces, generics, and advanced patterns.',
--   NOW() - INTERVAL '12 hours',
--   'https://github.com/sandipmaity/blog/pull/15',
--   ARRAY['docs', 'feature'],
--   'approved',
--   false
-- FROM repos r WHERE r.name = 'sandipmaity/blog'
-- ON CONFLICT DO NOTHING;

-- INSERT INTO events (repo_id, type, title, summary, body, timestamp, source_url, tags, status, pinned)
-- SELECT 
--   r.id,
--   'commit',
--   '3 new commits to main',
--   '• Update dependencies to latest versions\n• Improve SEO meta tags\n• Add sitemap generation',
--   'Multiple improvements including dependency updates, better SEO, and automatic sitemap generation.',
--   NOW() - INTERVAL '3 hours',
--   'https://github.com/sandipmaity/blog/compare/abc...def',
--   ARRAY['chore', 'feature'],
--   'approved',
--   false
-- FROM repos r WHERE r.name = 'sandipmaity/blog'
-- ON CONFLICT DO NOTHING;
