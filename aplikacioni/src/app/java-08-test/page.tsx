import { MeetingPoint } from "@/components/MeetingPoint";
import Link from "next/link";

export default function Week08Test() {
  return (
    <main>
      <h1>RideShare · Vendtakimi</h1>
      <p>Udhëtarja · Arta</p>
      <h2>Ferizaj → Kolegji AAB</h2>
      <p>Dritoni · ID 2 · 08:15 · 2 vende</p>
      <p>Të dhëna fiktive për ushtrime.</p>
      <MeetingPoint />
      <Link href="/" prefetch={false}>← Kthehu te lista</Link>
    </main>
  );
}
