"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { shtoPreferimin } from "@/lib/preferimet";

export async function ruajPreferimin(rideId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.githubId || typeof rideId !== "string" || !rideId.trim() || rideId.length > 200) {
      return { ok: false as const };
    }
    const result = await shtoPreferimin(session.user.githubId, rideId);
    if (!result) return { ok: false as const };
    return { ok: true as const, ...result };
  } catch {
    return { ok: false as const };
  }
}
