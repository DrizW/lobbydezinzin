"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
// i18n désactivé pour stabilité build

export default function BeneficesPage() {
  const t = (key: string) => {
    const dict: Record<string, string> = {
      'benef.title': 'Bénéfices',
      'benef.banner1': 'Ping en partie',
      'benef.banner2': 'Simplicité',
      'benef.banner3': 'Régions',
      'benef.card1.title': 'Matchs plus faciles',
      'benef.card1.p1': 'Accédez à des lobbies avec KD moyen plus bas',
      'benef.card1.p2': 'Plus de sérénité, plus de tops 1',
      'benef.card1.p3': 'Moins de tryhard et de tricheurs perçus',
      'benef.card2.title': 'Ping optimisé',
      'benef.card2.p1': 'Aucun changement dans vos parties locales',
      'benef.card2.p2': 'Le trafic jeu reste direct (DNS dédié)',
      'benef.card2.p3': 'Connexion stable et réactive',
      'benef.card3.title': 'Ultra simple',
      'benef.card3.p1': 'Configurez notre DNS sur votre console une fois',
      'benef.card3.p2': 'Changez de région depuis le dashboard',
      'benef.card3.p3': 'Effet immédiat sur vos prochains lobbies',
      'benef.cta': 'Commencer Gratuitement'
    };
    return dict[key] || key;
  };
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = [
    { title: t('benef.card1.title'), points: [t('benef.card1.p1'), t('benef.card1.p2'), t('benef.card1.p3')], badge: "KD 0.7 – 1.0", color: "from-orange-500 to-red-600", icon: "🏆" },
    { title: t('benef.card2.title'), points: [t('benef.card2.p1'), t('benef.card2.p2'), t('benef.card2.p3')], badge: "", color: "from-blue-500 to-cyan-600", icon: "⚡" },
    { title: t('benef.card3.title'), points: [t('benef.card3.p1'), t('benef.card3.p2'), t('benef.card3.p3')], badge: "", color: "from-green-500 to-emerald-600", icon: "🧩" }
  ];

  const highlights = [
    { label: t('benef.banner1'), value: "inchangé", color: "text-green-400" },
    { label: t('benef.banner2'), value: "DNS unique", color: "text-cyan-400" },
    { label: t('benef.banner3'), value: "au choix", color: "text-orange-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 animate-slow-pan bg-[radial-gradient(circle_at_20%_20%,rgba(255,115,0,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(0,180,255,0.12),transparent_40%)]"></div>
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">{t('benef.title')}</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl">
            Tout ce que vous gagnez avec le DNS LobbyDeZinzin, sans complexité et sans logiciel à installer.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {highlights.map(h => (
              <div key={h.label} className="px-3 py-1 rounded-full border border-gray-700/60 bg-gray-800/40 text-sm text-gray-200">
                <span className="text-gray-400 mr-1">{h.label}:</span>
                <span className={h.color}>{h.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((it) => (
            <div key={it.title} className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 hover:border-orange-500/40 transition-colors">
              <div className={`w-14 h-14 bg-gradient-to-br ${it.color} rounded-xl flex items-center justify-center mb-5 text-2xl shadow-lg`}>{it.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-3">{it.title}</h3>
              <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                {it.points.map(p => (<li key={p}>{p}</li>))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-cyan-500/10 border-y border-gray-700/40">
        <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-2">Pourquoi c’est plus facile ?</h4>
            <p className="text-gray-300 text-sm">Certaines régions offrent des lobbies globalement moins compétitifs. Vous choisissez la région, nous gérons la résolution DNS pour y accéder simplement.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Aucune appli requise</h4>
            <p className="text-gray-300 text-sm">Configurez un DNS primaire sur votre PS5/Xbox. Gérez la région depuis le dashboard, l’effet est immédiat sur vos prochains lobbies.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Transparence</h4>
            <p className="text-gray-300 text-sm">Votre région actuelle et l’heure locale s’affichent dans le dashboard. Changez à tout moment selon vos préférences.</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-14 text-center">
        <Link href="/register">
          <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-10 py-4 rounded-xl text-white font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105">
            {t('benef.cta')}
          </button>
        </Link>
      </section>

      {showSticky && (
        <div className="fixed bottom-3 left-3 right-3 md:hidden z-40">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-xl p-3 flex items-center justify-between">
            <div className="text-white font-semibold">Essayer maintenant</div>
            <Link href="/register" className="bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">S'inscrire</Link>
          </div>
        </div>
      )}
    </div>
  );
}
