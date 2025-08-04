import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Vérifier la session admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé - Admin requis" },
        { status: 403 }
      );
    }

    const { userId, activate } = await request.json();

    if (!userId || typeof activate !== "boolean") {
      return NextResponse.json(
        { error: "Paramètres invalides" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!targetUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Empêcher la modification des autres admins
    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "Impossible de modifier un compte administrateur" },
        { status: 403 }
      );
    }

    if (activate) {
      // Activer l'abonnement
      
      // D'abord désactiver les anciens abonnements
      await prisma.subscription.updateMany({
        where: {
          userId: userId,
          status: 'active'
        },
        data: {
          status: 'cancelled'
        }
      });

      // Créer un nouvel abonnement de 30 jours
      const subscription = await prisma.subscription.create({
        data: {
          userId: userId,
          stripeId: `admin_${Date.now()}_${userId}`, // ID factice pour admin
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        }
      });

      console.log(`✅ Admin ${adminUser.email} a activé l'abonnement pour ${targetUser.email}`);
      
      return NextResponse.json({
        message: "Abonnement activé avec succès",
        subscription: {
          id: subscription.id,
          expiresAt: subscription.currentPeriodEnd,
          activatedBy: adminUser.email
        }
      });

    } else {
      // Désactiver l'abonnement
      
      const updatedCount = await prisma.subscription.updateMany({
        where: {
          userId: userId,
          status: 'active'
        },
        data: {
          status: 'cancelled',
          // Expirer immédiatement
          currentPeriodEnd: new Date()
        }
      });

      console.log(`❌ Admin ${adminUser.email} a désactivé l'abonnement pour ${targetUser.email}`);

      return NextResponse.json({
        message: "Abonnement désactivé avec succès",
        updatedSubscriptions: updatedCount.count,
        deactivatedBy: adminUser.email
      });
    }

  } catch (error) {
    console.error("Erreur toggle subscription admin:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la modification de l'abonnement" },
      { status: 500 }
    );
  }
}