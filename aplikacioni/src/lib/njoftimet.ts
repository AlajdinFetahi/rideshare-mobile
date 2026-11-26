import "server-only";
import { getSql } from "./db";

export type Njoftim = {
  id: string;
  request_id: string;
  type: "accepted";
  created_at: string;
  read_at: string | null;
};
export type NjoftimetState = { notifications: Njoftim[]; unreadCount: number };
export type KerkesaDetail = { request_id: string; ride_id: string; status: string };

export async function lexoNjoftimet(userId: string): Promise<NjoftimetState> {
  const sql = getSql();
  const rows = await sql`
    SELECT COALESCE(json_agg(json_build_object(
      'id', id::text, 'request_id', request_id::text, 'type', type,
      'created_at', created_at, 'read_at', read_at) ORDER BY id DESC), '[]') AS notifications,
      count(*) FILTER (WHERE read_at IS NULL)::int AS "unreadCount"
    FROM njoftimet WHERE recipient_id = ${userId}
  `;
  return rows[0] as NjoftimetState;
}

export async function hapNjoftimin(userId: string, id: string): Promise<KerkesaDetail | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE njoftimet n SET read_at = COALESCE(n.read_at, NOW())
    FROM kerkesat k WHERE n.id = ${id}::bigint AND n.recipient_id = ${userId}
      AND k.id = n.request_id AND k.passenger_id = ${userId}
    RETURNING k.id::text AS request_id, k.ride_id, k.status
  `;
  return (rows[0] as KerkesaDetail | undefined) ?? null;
}
