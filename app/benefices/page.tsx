"use client";
import Link from "next/link";

export default function BeneficesPage() {
  const items = [
    {
      title: "Matchs plus faciles",
      points: [
        "Accédez à des lobbies avec KD moyen plus bas",
        "Plus de sérénité, plus de tops 1",
        "Moins de tryhard et de tricheurs perçus"
      ],
      badge: "KD moyen 0.7 – 1.0 (selon région)",
      color: "from-orange-500 to-red-600",
      icon: "🏆"
    },
    {
      title: "Ping optimisé",
      points: [
        "Aucun changement dans vos parties locales",
        "Le trafic jeu reste direct (DNS dédié)",
        "Connexion stable et réactive"
      ],
      badge: "Expérience fluide",
      color: "from-blue-500 to-cyan-600",
      icon: "⚡"
    },
    {
      title: "Ultra simple",
      points: [
        "Configurez notre DNS sur votre console une fois",
        "Changez de région depuis le dashboard",
        "Effet immédiat sur vos prochains lobbies"
      ],
      badge: "Sans PC, sans appli",
      color: "from-green-500 to-emerald-600",
      icon: "🧩"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Bénéfices</span>
          </h1>
          <p className="text-gray-300 text-lg">Tout ce que vous gagnez avec le DNS LobbyDeZinzin, sans complexité.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((it) => (
            <div key={it.title} className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50">
              <div className={`w-14 h-14 bg-gradient-to-br ${it.color} rounded-xl flex items-center justify-center mb-5 text-2xl`}>{it.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-3">{it.title}</h3>
              <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                {it.points.map(p => (<li key={p}>{p}</li>))}
              </ul>
              <div className="inline-block text-xs text-gray-200 bg-gray-700/50 border border-gray-600/60 rounded-full px-3 py-1">{it.badge}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-14">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50">
            <h4 className="text-white font-semibold mb-2">Pourquoi c’est plus facile ?</h4>
            <p className="text-gray-300 text-sm">Certaines régions offrent des lobbies globalement moins compétitifs. Notre DNS vous aide à y accéder sans modifier vos paramètres réseau avancés.</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50">
            <h4 className="text-white font-semibold mb-2">Pas de logiciel à installer</h4>
            <p className="text-gray-300 text-sm">Configurez simplement un DNS primaire sur votre PS5/Xbox. Tout le reste se gère depuis le dashboard web.</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50">
            <h4 className="text-white font-semibold mb-2">Transparence</h4>
            <p className="text-gray-300 text-sm">Vous contrôlez la région depuis l’interface. Les changements sont immédiats sur vos prochains lobbies.</p>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link href="/register">
            <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-10 py-4 rounded-xl text-white font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105">
              Commencer Gratuitement
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
