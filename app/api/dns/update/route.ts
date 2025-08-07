import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🌍 Configuration des régions pour géolocalisation DNS
const REGION_MAPPING = {
  nigeria: {
    geoIP: '41.223.84.20',
    country: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬'
  },
  taiwan: {
    geoIP: '203.74.205.156', 
    country: 'TW',
    name: 'Taiwan',
    flag: '🇹🇼'
  },
  morocco: {
    geoIP: '196.200.96.15',
    country: 'MA',
    name: 'Maroc', 
    flag: '🇲🇦'
  },
  thailand: {
    geoIP: '103.69.194.12',
    country: 'TH',
    name: 'Thaïlande',
    flag: '🇹🇭'
  },
  kenya: {
    geoIP: '197.248.21.8',
    country: 'KE', 
    name: 'Kenya',
    flag: '🇰🇪'
  }
};

/**
 * 🎯 POST /api/dns/update
 * 
 * Met à jour la région DNS pour le geolocation spoofing
 * Utilisé par le sélecteur de région pour changer la géolocalisation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { region } = await request.json();
    
    // Valider la région
    if (!region || !REGION_MAPPING[region as keyof typeof REGION_MAPPING]) {
      return NextResponse.json(
        { error: 'Région non valide' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscriptions: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier l'abonnement Premium pour le geolocation spoofing
    const hasPremiumSubscription = user.subscriptions?.some(sub => sub.type === 'PREMIUM' && sub.isActive);
    if (!hasPremiumSubscription) {
      return NextResponse.json(
        { error: 'Abonnement Premium requis pour changer de région' },
        { status: 403 }
      );
    }

    // Mettre à jour les paramètres DNS de l'utilisateur
    const regionConfig = REGION_MAPPING[region as keyof typeof REGION_MAPPING];
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Stocker la région sélectionnée pour le DNS server
        selectedCountry: region,
        lastUpdated: new Date()
      }
    });

    console.log(`🎯 DNS Update: ${user.email} → ${regionConfig.name} ${regionConfig.flag} (${regionConfig.geoIP})`);
    
    // Log pour monitoring du geolocation spoofing
    console.log(`🌍 Geolocation spoofing activé:`, {
      user: user.email,
      region: region,
      country: regionConfig.country,
      geoIP: regionConfig.geoIP,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      region: region,
      regionName: regionConfig.name,
      country: regionConfig.country,
      geoIP: regionConfig.geoIP,
      message: `Géolocalisation mise à jour vers ${regionConfig.name} ${regionConfig.flag}`
    });

  } catch (error) {
    console.error('❌ Erreur DNS update:', error);
    
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour DNS' },
      { status: 500 }
    );
  }
}

/**
 * 🔍 GET /api/dns/update
 * 
 * Récupère la configuration DNS actuelle de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscriptions: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const currentRegion = user.selectedCountry || 'nigeria';
    const regionConfig = REGION_MAPPING[currentRegion as keyof typeof REGION_MAPPING];

    return NextResponse.json({
      currentRegion: currentRegion,
      regionName: regionConfig?.name || 'Nigeria',
      country: regionConfig?.country || 'NG',
      geoIP: regionConfig?.geoIP || '41.223.84.20',
      isPremium: user.subscriptions?.some(sub => sub.type === 'PREMIUM' && sub.isActive) || false,
      lastUpdated: user.lastUpdated
    });

  } catch (error) {
    console.error('❌ Erreur GET DNS config:', error);
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
