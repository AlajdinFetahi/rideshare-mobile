import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hapNjoftimin, lexoNjoftimet } from "@/lib/njoftimet";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.githubId) return reply({ error: "Hyr me GitHub." }, 401);
    return reply(await lexoNjoftimet(session.user.githubId));
  } catch {
    return reply({ error: "Njoftimet nuk u lexuan. Provo përsëri." }, 503);
  }
}

export async function POST(request: Request) {
  const target = new URL(request.url);
  const origin = `${target.protocol}//${request.headers.get("host") ?? target.host}`;
  if (request.headers.get("origin") !== origin) return reply({ error: "Origjinë e palejuar." }, 403);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.githubId) return reply({ error: "Hyr me GitHub." }, 401);
    const body = await request.json();
    if (typeof body?.id !== "string" || !/^[1-9]\d{0,17}$/.test(body.id)) {
      return reply({ error: "ID e pavlefshme." }, 400);
    }
    const detail = await hapNjoftimin(session.user.githubId, body.id);
    if (!detail) return reply({ error: "Njoftimi nuk gjendet." }, 404);
    return reply({ detail, ...await lexoNjoftimet(session.user.githubId) });
  } catch {
    return reply({ error: "Leximi nuk u konfirmua. Provo përsëri." }, 503);
  }
}
