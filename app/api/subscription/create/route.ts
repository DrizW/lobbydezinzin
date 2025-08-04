import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Configuration des plans
const PLAN_CONFIGS = {
  basic: {
    name: "Basic",
    price: 999, // Prix en centimes (9.99€)
    priceId: "price_basic_monthly", // Remplacer par vos vrais Price IDs Stripe
  },
  premium: {
    name: "Premium", 
    price: 1999, // Prix en centimes (19.99€)
    priceId: "price_premium_monthly", // Remplacer par vos vrais Price IDs Stripe
  },
  pro: {
    name: "Pro",
    price: 3999, // Prix en centimes (39.99€)
    priceId: "price_pro_monthly", // Remplacer par vos vrais Price IDs Stripe
  }
};

export async function POST(request: NextRequest) {
  try {
    // Vérifier la session utilisateur
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    if (!planId || !PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS]) {
      return NextResponse.json(
        { error: "Plan invalide" },
        { status: 400 }
      );
    }

    const planConfig = PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS];

    // Vérifier si l'utilisateur existe
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

    // Vérifier si l'utilisateur a déjà un abonnement actif
    if (user.subscriptions.length > 0) {
      return NextResponse.json(
        { error: "Vous avez déjà un abonnement actif" },
        { status: 400 }
      );
    }

    // TODO: Intégrer Stripe Checkout Session
    // Exemple de code Stripe (à décommenter et configurer) :
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: planConfig.priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planId: planId
      }
    });
    
    return NextResponse.json({ checkoutUrl: session.url });
    */

    // Simulation pour les tests (à supprimer en production)
    console.log(`🔄 Création d'abonnement simulé pour ${user.email} - Plan: ${planConfig.name}`);
    
    // Créer un abonnement factice pour les tests
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        stripeId: `sim_${Date.now()}`, // ID factice
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      }
    });

    console.log(`✅ Abonnement créé: ${subscription.id}`);

    // Retourner une URL de succès simulée
    return NextResponse.json({ 
      checkoutUrl: `/dashboard?success=true&plan=${planId}`,
      message: "Abonnement créé avec succès (mode test)"
    });

  } catch (error) {
    console.error("Erreur lors de la création de l'abonnement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'abonnement" },
      { status: 500 }
    );
  }
}