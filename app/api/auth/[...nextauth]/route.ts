import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rateLimit";
import type { NextRequest } from "next/server";

const base = NextAuth({
  ...authOptions,
  events: {
    async signIn({ user, isNewUser }) {
      await recordAudit({ userId: user?.id as string, action: isNewUser ? "auth.signin.new" : "auth.signin" });
    },
    async signOut({ token }) {
      await recordAudit({ userId: token?.sub as string, action: "auth.signout" });
    },
  },
});

// Ajoute rate limit sur POST /api/auth/[...nextauth]
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
  const r = rateLimit({ key: `auth:${ip}`, windowMs: 15 * 60 * 1000, max: 30 });
  if (!r.allowed) return new Response(JSON.stringify({ error: 'Trop de requêtes' }), { status: 429, headers: { 'content-type': 'application/json' } });
  return (base as any).POST(request);
}

export const GET = (base as any).GET;
