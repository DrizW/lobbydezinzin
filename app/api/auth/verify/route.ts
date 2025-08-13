import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token requis" }, { status: 400 });
  const entry = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!entry || entry.expires < new Date()) return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 });
  await prisma.user.update({ where: { id: entry.userId }, data: { emailVerified: new Date() } });
  await prisma.emailVerificationToken.delete({ where: { token } });
  await recordAudit({ userId: entry.userId, action: "email.verify.success" });
  return NextResponse.json({ success: true });
}


