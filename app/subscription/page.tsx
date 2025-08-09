"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {useTranslations} from 'next-intl';

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
  const t = useTranslations();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!session) { window.location.href = "/login"; return; }
    setLoading(true); setSelectedPlan(planId);
    try {
      const response = await fetch("/api/subscription/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId }) });
      if (response.ok) { const { checkoutUrl } = await response.json(); window.location.href = checkoutUrl; }
      else { throw new Error("Subscription error"); }
    } catch (error) { console.error(error); alert("Erreur lors de l'abonnement. Veuillez réessayer."); }
    finally { setLoading(false); setSelectedPlan(null); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent">{t('subs.header.title1')}</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent">{t('subs.header.title2')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">{t('subs.subtitle')}</p>
        </div>

        <div className="flex justify-center mb-16">
          <div className="max-w-lg w-full">
            {plans.map((plan) => (
              <div key={plan.id} className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-orange-500/70 p-10 shadow-2xl shadow-orange-500/20 transform scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3 rounded-full text-white text-lg font-bold">🔥 {t('subs.plan.unique')}</div>
                </div>
                <div className="text-center mb-10 mt-4">
                  <h3 className="text-3xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="flex items-center justify-center mb-6">
                    <span className="text-5xl font-bold text-white">{plan.price}€</span>
                    <span className="text-gray-400 ml-3 text-xl">/{t('subs.plan.month')}</span>
                  </div>
                  <p className="text-gray-300 text-lg">{t('subs.plan.tagline')}</p>
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-gray-300 text-lg">
                      <svg className="w-6 h-6 text-green-400 mr-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleSubscribe(plan.id)} disabled={loading && selectedPlan === plan.id} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-5 rounded-xl text-white font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>{t('subs.plan.activating')}</div>
                  ) : (
                    t('subs.plan.activate', {price: plan.price})
                  )}
                </button>
                <p className="text-center text-gray-400 mt-4 text-sm">{t('subs.testMode')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8">
          <h3 className="text-3xl font-bold mb-8 text-center"><span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">{t('subs.faq').split(' ')[0]}</span><span className="text-white"> {t('subs.faq').split(' ').slice(1).join(' ')}</span></h3>
          {/* FAQ contenu laissé tel quel pour le moment */}
        </div>

        <div className="text-center mt-12">
          <Link href="/dashboard"><button className="border-2 border-gray-600 hover:border-orange-500 px-8 py-4 rounded-xl text-gray-300 hover:text-orange-400 font-bold text-lg transition-all duration-300">{t('subs.back')}</button></Link>
        </div>
      </div>
    </div>
  );
}