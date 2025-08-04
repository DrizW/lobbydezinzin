import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier la session utilisateur
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise pour accéder aux DNS" },
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
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier l'abonnement actif ou si admin
    const hasActiveSubscription = user.subscriptions.length > 0;
    const isAdmin = user.role === 'ADMIN';
    
    if (!hasActiveSubscription && !isAdmin) {
      // Retourner les pays sans les DNS pour les utilisateurs non abonnés
      const countries = await prisma.country.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          flag: true,
          kdRange: true,
          kdValue: true,
          description: true,
          color: true,
          // Ne pas inclure dnsPrimary et dnsSecondary
        },
        orderBy: { kdValue: 'asc' }
      });

      return NextResponse.json({
        countries: countries.map(country => ({
          ...country,
          dnsPrimary: "PREMIUM REQUIS",
          dnsSecondary: "PREMIUM REQUIS",
          isPremium: true
        })),
        requiresSubscription: true,
        message: "Abonnement Premium requis pour accéder aux DNS"
      });
    }

    // Utilisateur abonné ou admin - retourner toutes les données
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { kdValue: 'asc' }
    });

    return NextResponse.json({
      countries,
      requiresSubscription: false,
      hasAccess: true
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des pays:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des pays" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, flag, kdRange, kdValue, description, dnsPrimary, dnsSecondary, color } = body;

    const country = await prisma.country.create({
      data: {
        name,
        flag,
        kdRange,
        kdValue: parseFloat(kdValue),
        description,
        dnsPrimary,
        dnsSecondary,
        color
      }
    });

    return NextResponse.json(country);
  } catch (error) {
    console.error("Erreur lors de la création du pays:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du pays" },
      { status: 500 }
    );
  }
} 