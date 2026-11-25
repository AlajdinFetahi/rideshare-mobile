import "server-only";
import { getSql } from "./db";
import type { Udhetim } from "./udhetimet";

export type Gjendja = {
  ride: Udhetim;
  driver: boolean;
  requests: { id: string; status: "pending" | "accepted" }[];
};

export async function lexoGjendjen(userId: string, rideId: string): Promise<Gjendja | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT u.id, u.nisja, u.destinacioni, u.ora, u.vendtakimi, u.vende,
      (u.shofer_id = ${userId} AND p.roli = 'shofer') IS TRUE AS driver,
      COALESCE((SELECT json_agg(json_build_object('id', k.id::text, 'status', k.status) ORDER BY k.id)
        FROM kerkesat k WHERE k.ride_id = u.id AND
          ((u.shofer_id = ${userId} AND p.roli = 'shofer') OR k.passenger_id = ${userId})), '[]') AS requests
    FROM udhetimet u LEFT JOIN profilet p ON p.github_id = u.shofer_id
    WHERE u.id = ${rideId}
  `;
  if (!rows.length) return null;
  const { driver, requests, ...ride } = rows[0];
  return { ride: ride as Udhetim, driver, requests };
}

export async function dergoKerkesen(userId: string, rideId: string) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO kerkesat (ride_id, passenger_id)
    SELECT id, ${userId} FROM udhetimet
    WHERE id = ${rideId} AND vende > 0 AND shofer_id IS NOT NULL AND shofer_id <> ${userId}
    ON CONFLICT (ride_id, passenger_id) DO NOTHING RETURNING id
  `;
  if (rows.length) return true;
  const existing = await sql`SELECT id FROM kerkesat WHERE ride_id = ${rideId} AND passenger_id = ${userId}`;
  return existing.length > 0;
}

export async function pranoKerkesen(userId: string, rideId: string, requestId: string) {
  const sql = getSql();
  const rows = await sql`SELECT prano_kerkesen(${rideId}, ${requestId}::bigint, ${userId}) AS result`;
  return rows[0].result as string;
}
