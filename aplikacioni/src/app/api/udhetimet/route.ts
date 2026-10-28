import { lexoUdhetimet } from "@/lib/udhetimet";

export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const trips = (await lexoUdhetimet()).map(
      ({ id, nisja, destinacioni, ora, vendtakimi, vende }) =>
        ({ id, nisja, destinacioni, ora, vendtakimi, vende }),
    );
    return Response.json({ trips }, { headers });
  } catch {
    return Response.json({ error: "Lista nuk është në dispozicion." }, { status: 503, headers });
  }
}
