import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });
  await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  await prisma.twoFactorBackupCode.updateMany({ where: { userId, used: false }, data: { used: true, usedAt: new Date() } });
  return NextResponse.json({ success: true });
}

