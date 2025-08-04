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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        allowedIPs: true,
        role: true,
        subscription: {
          select: {
            status: true,
            currentPeriodEnd: true
          }
        },
        settings: {
          select: {
            selectedCountry: true
          }
        },
        _count: {
          select: {
            dnsLogs: true
          }
        }
      },
      orderBy: {
        email: 'asc'
      }
    });

    return NextResponse.json(users);
    
  } catch (error) {
    console.error('Erreur récupération utilisateurs avec IPs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}