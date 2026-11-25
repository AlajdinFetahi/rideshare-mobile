import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejUdhetimin } from "@/lib/udhetimet";
import { MeetingPoint } from "@/components/MeetingPoint";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { lexoPreferimet } from "@/lib/preferimet";
import { Preferimi } from "@/components/Preferimi";
import { Sinkronizimi } from "@/components/Sinkronizimi";
import { Hyrja } from "@/components/Hyrja";

export const dynamic = "force-dynamic";

export default async function Detajet({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let udhetim;

  try {
    udhetim = await gjejUdhetimin(id);
  } catch {
    return (
      <main>
        <h1>RideShare</h1>
        <p role="alert">Nuk u lidhëm me databazën. Provo përsëri.</p>
        <Link href="/">← Kthehu te lista</Link>
      </main>
    );
  }

  if (!udhetim) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  let favorites;
  let favoritesError = false;
  if (session?.user.githubId) {
    try {
      favorites = await lexoPreferimet(session.user.githubId, id);
    } catch {
      favoritesError = true;
    }
  }

  return (
    <main>
      <Link href="/">← Kthehu te lista</Link>
      <Sinkronizimi key={id} initialRide={udhetim} />
      {favorites && <Preferimi key={`${session?.user.githubId}:${id}`}
        rideId={id} initialSaved={favorites.saved} initialCount={favorites.count} />}
      {favoritesError && <p role="alert">Nuk u lexuan të preferuarat. Rifresko faqen.</p>}
      {!session?.user.githubId && <>
        <p>Hyr me GitHub për të ruajtur udhëtimin.</p>
        <Hyrja authenticated={false} />
      </>}
      <MeetingPoint />
      <Link className="action" href={`/udhetimi/${id}/kerkesa`}>
        Kërkesa dhe gjendja e udhëtimit
      </Link>
    </main>
  );
}
