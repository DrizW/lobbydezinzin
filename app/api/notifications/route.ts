import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const notifications = await prisma.userNotification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limiter à 50 notifications
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Marquer une notification comme lue
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { action, notificationId } = await request.json();

    if (action === 'markAsRead' && notificationId) {
      await prisma.userNotification.update({
        where: { 
          id: notificationId,
          userId: session.user.id // Sécurité : s'assurer que l'utilisateur possède la notification
        },
        data: { read: true }
      });
    } else if (action === 'markAllAsRead') {
      await prisma.userNotification.updateMany({
        where: { userId: session.user.id },
        data: { read: true }
      });
    } else if (action === 'delete' && notificationId) {
      await prisma.userNotification.delete({
        where: { 
          id: notificationId,
          userId: session.user.id
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
