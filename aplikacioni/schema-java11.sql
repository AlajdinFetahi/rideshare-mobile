CREATE TABLE IF NOT EXISTS njoftimet (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES kerkesat(id),
  recipient_id TEXT NOT NULL REFERENCES profilet(github_id),
  type TEXT NOT NULL CHECK (type = 'accepted'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  UNIQUE (request_id, type)
);
CREATE INDEX IF NOT EXISTS njoftimet_recipient_id_idx ON njoftimet (recipient_id, id DESC);
-- Kyçi i udhëtimit serializon pranimet, edhe për kërkesa të ndryshme.
CREATE OR REPLACE FUNCTION prano_kerkesen(p_ride TEXT, p_request BIGINT, p_driver TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_seats INTEGER;
  v_status TEXT;
BEGIN
  SELECT u.vende INTO v_seats FROM udhetimet u
  JOIN profilet p ON p.github_id = u.shofer_id
  WHERE u.id = p_ride AND u.shofer_id = p_driver AND p.roli = 'shofer'
  FOR UPDATE OF u;
  IF NOT FOUND THEN RETURN 'forbidden'; END IF;

  SELECT status INTO v_status FROM kerkesat
  WHERE id = p_request AND ride_id = p_ride FOR UPDATE;
  IF NOT FOUND THEN RETURN 'missing'; END IF;
  IF v_status = 'accepted' THEN RETURN 'accepted'; END IF;
  IF v_seats <= 0 THEN RETURN 'full'; END IF;

  UPDATE kerkesat SET status = 'accepted' WHERE id = p_request;
  UPDATE udhetimet SET vende = vende - 1 WHERE id = p_ride;
  INSERT INTO njoftimet (request_id, recipient_id, type)
  SELECT id, passenger_id, 'accepted' FROM kerkesat WHERE id = p_request
  ON CONFLICT (request_id, type) DO NOTHING;
  RETURN 'accepted';
END;
$$;
