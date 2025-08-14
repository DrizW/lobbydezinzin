import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { currentPassword } = await req.json().catch(() => ({ currentPassword: "" }));
  if (!currentPassword) return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) return NextResponse.json({ error: "Compte invalide" }, { status: 400 });

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    await recordAudit({ userId: session.user.id, action: "2fa.disable.failed", details: { reason: "bad_password" } });
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  await prisma.twoFactorBackupCode.updateMany({ where: { userId: session.user.id, used: false }, data: { used: true, usedAt: new Date() } });
  await recordAudit({ userId: session.user.id, action: "2fa.disabled" });
  return NextResponse.json({ success: true });
}

