import "server-only";
import { getSql } from "./db";

export async function ndryshoOren(githubId: string | undefined, id: string, ora: string) {
  if (!githubId) return "sesion";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(ora)) return "ora";
  const sql = getSql();
  const rows = await sql`
    UPDATE udhetimet AS u SET ora = ${ora}
    FROM profilet AS p
    WHERE u.id = ${id} AND u.shofer_id = ${githubId}
      AND p.github_id = u.shofer_id AND p.roli = 'shofer'
    RETURNING u.id
  `;
  return rows.length ? "sukses" : "refuzim";
}
