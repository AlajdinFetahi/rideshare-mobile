CREATE TABLE IF NOT EXISTS preferimet (
  user_id TEXT NOT NULL REFERENCES profilet(github_id),
  ride_id TEXT NOT NULL REFERENCES udhetimet(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT preferimet_user_ride_unique UNIQUE (user_id, ride_id)
);
