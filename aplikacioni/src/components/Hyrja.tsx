"use client";

import { signIn, signOut } from "next-auth/react";

export function Hyrja({ authenticated }: { authenticated: boolean }) {
  return authenticated ? (
    <button className="action" onClick={() => signOut({ callbackUrl: "/panel" })}>Dil</button>
  ) : (
    <button className="action" onClick={() => signIn("github", { callbackUrl: "/panel" })}>Hyr me GitHub</button>
  );
}
