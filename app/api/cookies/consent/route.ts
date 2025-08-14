import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordAnalytics } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    
    if (!session?.user?.email && !sessionId) {
      return NextResponse.json({ error: 'Session ID requis pour les utilisateurs non connectés' }, { status: 400 });
    }

    let consent;
    
    if (session?.user?.email) {
      // Utilisateur connecté
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (user) {
        consent = await prisma.cookieConsent.findFirst({
          where: { userId: user.id },
          orderBy: { updatedAt: 'desc' }
        });
      }
    } else {
      // Utilisateur non connecté
      consent = await prisma.cookieConsent.findFirst({
        where: { sessionId },
        orderBy: { updatedAt: 'desc' }
      });
    }

    return NextResponse.json({ 
      consent: consent || {
        essential: true,
        analytics: false,
        marketing: false,
        performance: false,
        preferences: false
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du consentement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { 
      essential = true, 
      analytics = false, 
      marketing = false, 
      performance = false, 
      preferences = false,
      sessionId 
    } = await request.json();

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    let userId: string | undefined;
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      userId = user?.id;
    }

    // Créer ou mettre à jour le consentement
    const consent = await prisma.cookieConsent.create({
      data: {
        userId,
        sessionId: sessionId || undefined,
        essential,
        analytics,
        marketing,
        performance,
        preferences,
        ip,
        userAgent
      }
    });

    // Enregistrer l'événement analytics
    await recordAnalytics({
      event: 'cookie_consent_updated',
      category: 'privacy',
      action: 'consent_updated',
      label: `essential:${essential},analytics:${analytics},marketing:${marketing},performance:${performance},preferences:${preferences}`,
      userId,
      sessionId,
      req: request
    });

    return NextResponse.json({ success: true, consent });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du consentement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
