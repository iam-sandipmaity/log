-- Create repos table
CREATE TABLE IF NOT EXISTS repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('commit', 'release', 'pr_merge', 'pr_closed', 'repo_update', 'issue', 'issue_closed')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  source_url TEXT NOT NULL,
  github_delivery_id TEXT,
  github_event_id TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_id, github_event_id, type)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_repo_id ON events(repo_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_pinned ON events(pinned);
CREATE INDEX IF NOT EXISTS idx_events_github_delivery_id ON events(github_delivery_id);
CREATE INDEX IF NOT EXISTS idx_events_github_event_id ON events(github_event_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists (for re-running script)
DROP TRIGGER IF EXISTS update_events_updated_at ON events;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Public repos read access" ON repos;
DROP POLICY IF EXISTS "Public approved events read access" ON events;
DROP POLICY IF EXISTS "Admin repos all access" ON repos;
DROP POLICY IF EXISTS "Admin events all access" ON events;

-- Create policies for public read access
CREATE POLICY "Public repos read access" ON repos
  FOR SELECT USING (true);

CREATE POLICY "Public approved events read access" ON events
  FOR SELECT USING (status = 'approved');

-- Admin policies (you'll need to set up authentication)
-- For now, we'll allow all operations for simplicity
CREATE POLICY "Admin repos all access" ON repos
  FOR ALL USING (true);

CREATE POLICY "Admin events all access" ON events
  FOR ALL USING (true);
