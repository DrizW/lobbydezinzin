import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { token } = await req.json();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.twoFactorSecret) return NextResponse.json({ error: "2FA non initialisé" }, { status: 400 });
  const valid = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: "base32", token, window: 1 });
  if (!valid) return NextResponse.json({ error: "Code invalide" }, { status: 400 });
  await recordAudit({ userId: session.user.id, action: "2fa.verified" });
  return NextResponse.json({ success: true });
}


