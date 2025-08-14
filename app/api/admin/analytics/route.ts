import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    
    // Calculer la date de début selon la période
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    // Récupérer les événements de la période
    const events = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limiter à 100 événements récents
    });

    // Calculer les statistiques
    const totalEvents = await prisma.analyticsEvent.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    const uniqueUsers = await prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate
        },
        userId: {
          not: null
        }
      }
    });

    // Top événements
    const topEvents = await prisma.analyticsEvent.groupBy({
      by: ['event'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        event: true
      },
      orderBy: {
        _count: {
          event: 'desc'
        }
      },
      take: 10
    });

    // Top catégories
    const topCategories = await prisma.analyticsEvent.groupBy({
      by: ['category'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      },
      take: 10
    });

    return NextResponse.json({
      totalEvents,
      uniqueUsers: uniqueUsers.length,
      topEvents: topEvents.map(item => ({
        event: item.event,
        count: item._count.event
      })),
      topCategories: topCategories.map(item => ({
        category: item.category,
        count: item._count.category
      })),
      recentEvents: events
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
