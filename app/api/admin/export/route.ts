import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toCSV(rows: any[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => '"' + String(v ?? '').replaceAll('"', '""') + '"';
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(headers.map(h => esc((r as any)[h])).join(','));
  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') return new Response('Forbidden', { status: 403 });
  const type = req.nextUrl.searchParams.get('type'); // users|dns|transactions
  let rows: any[] = [];
  if (type === 'users') {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, emailVerified: true, twoFactorEnabled: true } as any });
    rows = users;
  } else if (type === 'dns') {
    const logs = await prisma.dNSLog.findMany({ select: { id: true, userId: true, domain: true, region: true, clientIP: true, timestamp: true } as any });
    rows = logs;
  } else if (type === 'transactions') {
    const tx = await prisma.subscription.findMany({ select: { id: true, userId: true, stripeId: true, status: true, currentPeriodEnd: true, createdAt: true, updatedAt: true } as any });
    rows = tx;
  } else {
    return new Response('Bad request', { status: 400 });
  }
  const csv = toCSV(rows);
  return new Response(csv, { headers: { 'content-type': 'text/csv', 'content-disposition': `attachment; filename="${type}.csv"` } });
}


