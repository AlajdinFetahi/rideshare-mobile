CREATE TABLE IF NOT EXISTS kerkesat (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ride_id TEXT NOT NULL REFERENCES udhetimet(id),
  passenger_id TEXT NOT NULL REFERENCES profilet(github_id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  UNIQUE (ride_id, passenger_id)
);

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
  RETURN 'accepted';
END;
$$;
