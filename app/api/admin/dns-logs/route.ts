import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');

    const dnsLogs = await prisma.dNSLog.findMany({
      where: userId ? { userId } : {},
      select: {
        id: true,
        domain: true,
        region: true,
        clientIP: true,
        timestamp: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });

    return NextResponse.json(dnsLogs);
    
  } catch (error) {
    console.error('Erreur récupération logs DNS:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}