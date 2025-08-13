import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const status = req.nextUrl.searchParams.get('status'); // active|expired|canceled|null
  const where: any = {};
  if (status === 'active') where.AND = [{ status: 'active' }, { currentPeriodEnd: { gt: new Date() } }];
  if (status === 'expired') where.OR = [{ status: 'expired' }, { currentPeriodEnd: { lte: new Date() } }];
  if (status === 'canceled') where.status = 'canceled';

  const subs = await prisma.subscription.findMany({
    where,
    include: { user: { select: { id: true, email: true, role: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ subscriptions: subs });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { subscriptionId, action } = await req.json(); // action: cancel/expire
  if (!subscriptionId || !action) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const data: any = {};
  if (action === 'cancel') data.status = 'canceled';
  if (action === 'expire') data.status = 'expired';
  const sub = await prisma.subscription.update({ where: { id: subscriptionId }, data });
  return NextResponse.json({ success: true, subscription: sub });
}


