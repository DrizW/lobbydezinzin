import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  await prisma.twoFactorBackupCode.updateMany({ where: { userId: session.user.id, used: false }, data: { used: true, usedAt: new Date() } });
  await recordAudit({ userId: session.user.id, action: "2fa.disabled" });
  return NextResponse.json({ success: true });
}

