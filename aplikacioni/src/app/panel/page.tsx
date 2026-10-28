import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { Hyrja } from "@/components/Hyrja";
import { ruajOren } from "./actions";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, string> = {
  sukses: "Ora u ndryshua me sukses.",
  refuzim: "Refuzuar: vetëm shoferi pronar mund ta ndryshojë këtë udhëtim.",
  sesion: "Mungon sesioni. Hyr me GitHub.",
  ora: "Ora duhet të jetë në formatin HH:mm (00:00–23:59).",
  databaza: "Gabim databaze. Provo përsëri.",
};

export default async function Panel({ searchParams }: {
  searchParams: Promise<{ rezultati?: string }>;
}) {
  const { rezultati } = await searchParams;
  const session = await getServerSession(authOptions);
  let profil;
  let gabim = false;
  if (session?.user.githubId) {
    try {
      const sql = getSql();
      [profil] = await sql`SELECT emri, roli FROM profilet WHERE github_id = ${session.user.githubId}`;
    } catch {
      gabim = true;
    }
  }
  return (
    <main>
      <Link href="/">← Kthehu te lista</Link>
      <h1>Paneli im</h1>
      <Hyrja authenticated={!!session} />
      {rezultati && mesazhet[rezultati] && <p role="status">{mesazhet[rezultati]}</p>}
      {gabim && <p role="alert">{mesazhet.databaza}</p>}
      {!session && <p>Mungon sesioni. Hyr me GitHub.</p>}
      {session && profil && <>
        <p>Emri: {profil.emri}</p>
        <p>Roli: {profil.roli}</p>
        <p>GitHub ID: {session.user.githubId}</p>
        {profil.roli === "shofer" && <form action={ruajOren}>
          <h2>Ndrysho orën e udhëtimit 2</h2>
          <input type="hidden" name="id" value="2" />
          <label htmlFor="ora">Ora (HH:mm): </label>
          <input id="ora" name="ora" type="text" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" placeholder="08:15" required />
          <button className="action" type="submit">Ruaj orën</button>
        </form>}
      </>}
    </main>
  );
}
