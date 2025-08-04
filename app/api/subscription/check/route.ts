import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fonction pour obtenir l'IP réelle du client
function getClientIP(request: NextRequest): string {
  // Vérifier différents headers pour l'IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-remote-addr');
  
  if (forwarded) {
    // x-forwarded-for peut contenir plusieurs IPs, prendre la première
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (remoteAddr) {
    return remoteAddr;
  }
  
  // Fallback sur l'IP de la requête
  return request.ip || 'unknown';
}

// Fonction pour déterminer le pays basé sur IP (simulé)
function getCountryFromIP(ip: string): string {
  // En production, vous utiliseriez un service de géolocalisation comme:
  // - MaxMind GeoIP2
  // - ip-api.com
  // - ipinfo.io
  
  // Pour l'instant, simulation basée sur des plages d'IP
  const ipRanges = {
    'nigeria': ['41.', '129.', '196.'],
    'israel': ['5.', '37.', '109.'],
    'thailand': ['14.', '27.', '49.'],
    'taiwan': ['1.', '36.', '114.'],
    'cambodia': ['27.', '103.'],
    'morocco': ['41.', '105.', '196.'],
    'algeria': ['41.', '105.', '196.'],
    'tunisia': ['41.', '196.'],
    'kenya': ['41.', '105.', '196.']
  };
  
  for (const [country, prefixes] of Object.entries(ipRanges)) {
    if (prefixes.some(prefix => ip.startsWith(prefix))) {
      return country;
    }
  }
  
  // IP par défaut autorisée (pour les tests locaux)
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === 'unknown') {
    return 'test'; // Autoriser en local
  }
  
  return 'unknown';
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier la session utilisateur
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié", hasAccess: false },
        { status: 401 }
      );
    }

    // Récupérer les informations utilisateur avec abonnements
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: {
            status: 'active',
            currentPeriodEnd: {
              gt: new Date()
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé", hasAccess: false },
        { status: 404 }
      );
    }

    // Vérifier l'abonnement actif
    const hasActiveSubscription = user.subscriptions.length > 0;
    
    // Obtenir l'IP du client
    const clientIP = getClientIP(request);
    const userCountry = getCountryFromIP(clientIP);
    
    return NextResponse.json({
      hasAccess: hasActiveSubscription || user.role === 'ADMIN',
      isSubscribed: hasActiveSubscription,
      isAdmin: user.role === 'ADMIN',
      clientIP,
      detectedCountry: userCountry,
      subscriptionInfo: hasActiveSubscription ? {
        status: user.subscriptions[0].status,
        expiresAt: user.subscriptions[0].currentPeriodEnd
      } : null
    });

  } catch (error) {
    console.error("Erreur lors de la vérification d'accès:", error);
    return NextResponse.json(
      { error: "Erreur serveur", hasAccess: false },
      { status: 500 }
    );
  }
}