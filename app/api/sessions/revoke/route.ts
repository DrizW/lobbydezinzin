import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'ID de session requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier que la session appartient à l'utilisateur
    const userSession = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id
      }
    });

    if (!userSession) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 });
    }

    // Supprimer la session
    await prisma.userSession.delete({
      where: { id: sessionId }
    });

    // Enregistrer l'audit
    await recordAudit({
      userId: user.id,
      action: 'SESSION_REVOKED',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        sessionId,
        deviceName: userSession.deviceName,
        deviceType: userSession.deviceType,
        browser: userSession.browser,
        os: userSession.os,
        ip: userSession.ip
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la révocation de session:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
