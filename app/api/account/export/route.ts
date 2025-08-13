import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const userId = session.user.id;
  const [user, settings, subs, logs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true, createdAt: true } as any }),
    prisma.userSettings.findUnique({ where: { userId } }),
    prisma.subscription.findMany({ where: { userId } }),
    prisma.dNSLog.findMany({ where: { userId }, take: 1000 })
  ]);
  return NextResponse.json({ user, settings, subscriptions: subs, dnsLogs: logs });
}


