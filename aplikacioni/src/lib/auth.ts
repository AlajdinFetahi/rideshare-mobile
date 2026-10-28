import type { NextAuthOptions, DefaultSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { getSql } from "./db";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { githubId: string };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [GitHubProvider({
    clientId: process.env.GITHUB_ID ?? "",
    clientSecret: process.env.GITHUB_SECRET ?? "",
  })],
  session: { strategy: "jwt", maxAge: 2 * 60 * 60 },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubId = account.providerAccountId;
        if (!/^\d+$/.test(githubId)) throw new Error("Identitet GitHub i pavlefshëm.");
        const sql = getSql();
        await sql`
          INSERT INTO profilet (github_id, emri)
          VALUES (${githubId}, ${profile.name ?? token.name ?? "GitHub"})
          ON CONFLICT (github_id) DO UPDATE SET emri = EXCLUDED.emri
        `;
        token.githubId = githubId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.githubId = typeof token.githubId === "string" ? token.githubId : "";
      return session;
    },
  },
};
