import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dergoKerkesen, lexoGjendjen, pranoKerkesen } from "@/lib/kerkesat";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.githubId) return reply({ error: "Hyr me GitHub." }, 401);
    const { id } = await params;
    const state = await lexoGjendjen(session.user.githubId, id);
    if (!state) return reply({ error: "Udhëtimi mungon." }, 404);
    if (new URL(request.url).searchParams.get("driver") === "1" && !state.driver) {
      return reply({ error: "Nuk je shoferi pronar." }, 403);
    }
    return reply(state);
  } catch {
    return reply({ error: "Nuk u lexua gjendja." }, 503);
  }
}

export async function POST(request: Request, { params }: Context) {
  const target = new URL(request.url);
  const expectedOrigin = `${target.protocol}//${request.headers.get("host") ?? target.host}`;
  if (request.headers.get("origin") !== expectedOrigin) {
    return reply({ error: "Origjinë e palejuar." }, 403);
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.githubId) return reply({ error: "Hyr me GitHub." }, 401);
    const { id } = await params;
    const body = await request.json();
    if (body.action === "request") {
      if (!await dergoKerkesen(session.user.githubId, id)) {
        return reply({ error: "Kërkesa nuk mund të dërgohet." }, 409);
      }
    } else if (body.action === "accept" && typeof body.requestId === "string" && /^\d{1,18}$/.test(body.requestId)) {
      const result = await pranoKerkesen(session.user.githubId, id, body.requestId);
      if (result !== "accepted") {
        return reply({ error: result === "full" ? "Nuk ka vende të lira." : "Pranim i palejuar." }, result === "full" ? 409 : 403);
      }
    } else {
      return reply({ error: "Veprim i pavlefshëm." }, 400);
    }
    return reply({ ok: true });
  } catch {
    return reply({ error: "Veprimi nuk u konfirmua. Provo përsëri." }, 503);
  }
}
