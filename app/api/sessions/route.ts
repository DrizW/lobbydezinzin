import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userSessions: {
          orderBy: { lastActivity: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ sessions: user.userSessions });
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { sessionToken, deviceInfo } = await request.json();
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Token de session requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Marquer toutes les autres sessions comme non-actuelles
    await prisma.userSession.updateMany({
      where: { userId: user.id },
      data: { isCurrent: false }
    });

    // Créer ou mettre à jour la session actuelle
    const userSession = await prisma.userSession.upsert({
      where: { sessionToken },
      update: {
        isCurrent: true,
        lastActivity: new Date(),
        ...(deviceInfo && {
          deviceName: deviceInfo.deviceName,
          deviceType: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ip: deviceInfo.ip,
          location: deviceInfo.location
        })
      },
      create: {
        userId: user.id,
        sessionToken,
        isCurrent: true,
        ...(deviceInfo && {
          deviceName: deviceInfo.deviceName,
          deviceType: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ip: deviceInfo.ip,
          location: deviceInfo.location
        })
      }
    });

    return NextResponse.json({ session: userSession });
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour de session:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
