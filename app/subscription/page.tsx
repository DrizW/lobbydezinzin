"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const plans = [
  {
    id: "premium",
    name: "LobbyDeZinzin Premium",
    price: "19.99",
    duration: "mois",
    features: [
      "🌍 Accès à toutes les régions (9 pays)",
      "🎮 Lobbies ultra-faciles (KD 0.6-1.4)",
      "⚡ DNS optimisés par région",
      "📊 Statistiques de performance",
      "🛠️ Configuration PS5/Xbox/PC",
      "💬 Support prioritaire 24/7",
      "🔄 Rotation intelligente des serveurs",
      "📱 Interface gaming moderne",
      "🎯 Efficacité garantie 90%+",
      "❌ Aucun risque de ban"
    ],
    color: "from-orange-500 to-red-600",
    popular: true
  }
];

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch("/api/subscription/check", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setIsSubscribed(Boolean(data?.isSubscribed));
          setIsAdmin(Boolean(data?.isAdmin));
          setExpiresAt(data?.subscriptionInfo?.expiresAt ?? null);
        }
      } catch {
        // silencieux: on laisse l'utilisateur voir la page d'achat si check échoue
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [router]);

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    setSelectedPlan(planId);

    try {
      // TODO: Intégrer Stripe Checkout
      console.log(`Abonnement au plan: ${planId}`);
      
      // Simulation d'un appel API
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        // Rediriger vers Stripe Checkout
        const { checkoutUrl } = await response.json();
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Erreur lors de la création de l'abonnement");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'abonnement. Veuillez réessayer.");
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent">
              CHOISISSEZ
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              VOTRE PLAN
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Accédez aux meilleurs lobbies Warzone et dominez la compétition avec nos DNS optimisés
          </p>
        </div>

        {checking ? (
          <div className="flex justify-center items-center mb-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mr-3"></div>
            <span className="text-gray-300">Vérification de votre statut...</span>
          </div>
        ) : isSubscribed || isAdmin ? (
          <div className="flex justify-center mb-16">
            <div className="max-w-2xl w-full text-center rounded-2xl p-10 bg-gradient-to-br from-emerald-700/40 to-emerald-900/40 border border-emerald-500/50 shadow-2xl">
              <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 rounded-full bg-emerald-600/20 border border-emerald-400/30 text-emerald-200">
                <span className="text-xl">✅</span>
                <span className="font-semibold">Premium actif</span>
              </div>
              <h3 className="text-3xl font-bold text-emerald-300 mb-3">Vous êtes déjà en Premium</h3>
              <p className="text-emerald-100/90 mb-6">Merci pour votre soutien. Votre accès aux régions optimisées est actif.</p>
              {expiresAt && (
                <p className="text-emerald-200/80 mb-8">Renouvellement le: {new Date(expiresAt).toLocaleString()}</p>
              )}
              <div className="flex justify-center gap-4">
                <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 transform hover:scale-105">Aller au Dashboard</Link>
                <Link href="/contact" className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-200 font-semibold border border-gray-600/60 transition-all duration-200">Support</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-16">
            <div className="max-w-lg w-full">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-orange-500/70 p-10 shadow-2xl shadow-orange-500/20 transform scale-105"
                >
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3 rounded-full text-white text-lg font-bold">
                      🔥 PLAN UNIQUE
                    </div>
                  </div>

                  <div className="text-center mb-10 mt-4">
                    <h3 className="text-3xl font-bold text-white mb-4">{plan.name}</h3>
                    <div className="flex items-center justify-center mb-6">
                      <span className="text-5xl font-bold text-white">{plan.price}€</span>
                      <span className="text-gray-400 ml-3 text-xl">/{plan.duration}</span>
                    </div>
                    <p className="text-gray-300 text-lg">
                      La solution ultime pour dominer Warzone avec des lobbies faciles
                    </p>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-gray-300 text-lg">
                        <svg className="w-6 h-6 text-green-400 mr-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading && selectedPlan === plan.id}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-5 rounded-xl text-white font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && selectedPlan === plan.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Activation en cours...
                      </div>
                    ) : (
                      `🚀 Activer Premium - ${plan.price}€/mois`
                    )}
                  </button>
                  
                  <p className="text-center text-gray-400 mt-4 text-sm">
                    💳 Mode test activé - Aucun paiement réel pour l'instant
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8">
          <h3 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              QUESTIONS
            </span>
            <span className="text-white"> FRÉQUENTES</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-white mb-2">❓ Comment ça marche ?</h4>
                <p className="text-gray-300 text-sm">
                  Nos DNS redirigent votre connexion Warzone vers des serveurs dans les régions où les joueurs ont un KD plus bas, vous donnant des lobbies plus faciles.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-2">🎮 Compatible avec quoi ?</h4>
                <p className="text-gray-300 text-sm">
                  PS4, PS5, Xbox One, Xbox Series X/S, PC. Configuration simple en quelques minutes.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-2">⚡ Ça affecte la latence ?</h4>
                <p className="text-gray-300 text-sm">
                  Nos serveurs sont optimisés pour minimiser la latence. La plupart des utilisateurs ne remarquent aucune différence.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-white mb-2">🔒 C'est sécurisé ?</h4>
                <p className="text-gray-300 text-sm">
                  Absolument. Nous utilisons uniquement des méthodes DNS légales. Aucun risque de ban.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-2">💰 Puis-je annuler ?</h4>
                <p className="text-gray-300 text-sm">
                  Oui, vous pouvez annuler à tout moment. Aucun engagement, facturation mensuelle.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-2">🎯 Garantie de résultats ?</h4>
                <p className="text-gray-300 text-sm">
                  30 jours satisfait ou remboursé. Si vous n'obtenez pas de meilleurs lobbies, nous vous remboursons.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link href="/dashboard">
            <button className="border-2 border-gray-600 hover:border-orange-500 px-8 py-4 rounded-xl text-gray-300 hover:text-orange-400 font-bold text-lg transition-all duration-300">
              ← Retour au Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}