import "server-only";
import { getSql } from "./db";

export async function lexoPreferimet(userId: string, rideId: string) {
  const sql = getSql();
  const [row] = await sql`
    SELECT COUNT(*)::int AS count,
           COALESCE(BOOL_OR(ride_id = ${rideId}), false) AS saved
    FROM preferimet WHERE user_id = ${userId}
  `;
  return { saved: Boolean(row.saved), count: Number(row.count) };
}

export async function shtoPreferimin(userId: string, rideId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT id FROM udhetimet WHERE id = ${rideId}
  `;
  if (rows.length === 0) return null;

  await sql`
    INSERT INTO preferimet (user_id, ride_id)
    VALUES (${userId}, ${rideId})
    ON CONFLICT (user_id, ride_id) DO NOTHING
  `;
  return lexoPreferimet(userId, rideId);
}
