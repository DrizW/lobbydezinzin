import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAnalytics } from "@/lib/analytics";
import { notificationService } from "@/lib/notifications";

// GET - Récupérer les paramètres utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer ou créer les paramètres utilisateur
    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });

    if (!settings) {
      // Créer des paramètres par défaut
      settings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          selectedCountry: "south-africa", // Pays par défaut (Johannesburg)
          autoRotate: false
        }
      });
    }

    return NextResponse.json({
      selectedCountry: settings.selectedCountry,
      autoRotate: settings.autoRotate,
      lastUpdated: settings.lastUpdated
    });

  } catch (error) {
    console.error("Erreur récupération paramètres:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Mettre à jour la région sélectionnée
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { selectedCountry, autoRotate } = await request.json();

    if (!selectedCountry) {
      return NextResponse.json(
        { error: "Pays requis" },
        { status: 400 }
      );
    }

    // Valider que le pays existe
    const validCountries = [
      "south-africa", "nigeria", "taiwan", "israel", "thailand", "cambodia", 
      "morocco", "algeria", "tunisia", "kenya"
    ];

    if (!validCountries.includes(selectedCountry)) {
      return NextResponse.json(
        { error: "Pays invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a un abonnement actif
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

    // Vérifier l'abonnement (sauf pour les admins)
    const hasAccess = user.subscriptions.length > 0 || user.role === "ADMIN";
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Abonnement Premium requis pour changer de région" },
        { status: 403 }
      );
    }

    // Récupérer l'ancienne région pour l'analytics
    const oldSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });
    const oldRegion = oldSettings?.selectedCountry || 'nigeria';

    // Mettre à jour ou créer les paramètres
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        selectedCountry,
        autoRotate: autoRotate || false,
        lastUpdated: new Date()
      },
      create: {
        userId: session.user.id,
        selectedCountry,
        autoRotate: autoRotate || false
      }
    });

                    // Enregistrer l'événement analytics si la région a changé
                if (oldRegion !== selectedCountry) {
                  await recordAnalytics({
                    event: 'region_changed',
                    category: 'region',
                    action: 'changed',
                    label: `${oldRegion} → ${selectedCountry}`,
                    userId: session.user.id,
                    req: request
                  });

                  // Créer une notification de changement de région
                  try {
                    notificationService.add({
                      type: 'info',
                      title: 'Région mise à jour',
                      message: `Votre région a été changée de ${oldRegion} vers ${selectedCountry}`,
                      read: false,
                      action: {
                        label: 'Voir le dashboard',
                        url: '/dashboard'
                      }
                    });
                  } catch (error) {
                    console.error('Erreur lors de la création de la notification:', error);
                  }
                }

    console.log(`🌍 ${user.email} a changé de région: ${selectedCountry}`);

    return NextResponse.json({
      success: true,
      selectedCountry: settings.selectedCountry,
      autoRotate: settings.autoRotate,
      message: `Région changée vers ${selectedCountry}`
    });

  } catch (error) {
    console.error("Erreur mise à jour paramètres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}