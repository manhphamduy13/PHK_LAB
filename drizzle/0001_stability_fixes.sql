-- Stability and security fixes for existing PostgreSQL deployments.
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS source_document_id text REFERENCES documents(id);
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS type text DEFAULT 'TRAC NGHIEM';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'MEDIUM';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS concept_id text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS exercise_id text REFERENCES exercises(id);
CREATE TABLE IF NOT EXISTS audit_logs (
  id text PRIMARY KEY,
  actor_id text REFERENCES users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  metadata text,
  created_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
