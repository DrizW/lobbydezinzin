import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        subscriptions: {
          select: {
            status: true,
            currentPeriodEnd: true
          }
        }
      }
    });

    // Transformer les données pour l'affichage
    const usersWithStatus = users.map(user => {
      const activeSubscription = user.subscriptions.find(sub => 
        sub.status === 'active' && sub.currentPeriodEnd > new Date()
      );
      
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: activeSubscription ? "actif" : "gratuit"
      };
    });

    return NextResponse.json(usersWithStatus);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Supprimer l'utilisateur et toutes ses données associées
    await prisma.user.delete({
      where: { email }
    });

    return NextResponse.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
} 