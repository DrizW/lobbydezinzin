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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Compter les sessions qui seront supprimées
    const sessionsToDelete = await prisma.userSession.count({
      where: {
        userId: user.id,
        isCurrent: false
      }
    });

    // Supprimer toutes les sessions sauf la session actuelle
    await prisma.userSession.deleteMany({
      where: {
        userId: user.id,
        isCurrent: false
      }
    });

    // Enregistrer l'audit
    await recordAudit({
      userId: user.id,
      action: 'ALL_SESSIONS_REVOKED',
      req: request,
      details: {
        sessionsRevoked: sessionsToDelete
      }
    });

    return NextResponse.json({ 
      success: true, 
      sessionsRevoked: sessionsToDelete 
    });
  } catch (error) {
    console.error('Erreur lors de la révocation de toutes les sessions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
