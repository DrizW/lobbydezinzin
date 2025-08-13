"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center"><span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Bienvenue !</span></h1>
        <p className="text-gray-300 text-center mb-8">Suivez ces étapes pour configurer LobbyDeZinzin.</p>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">Étape 1 — Choisir votre plateforme</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['PS5', 'Xbox', 'PC', 'PS4'].map((p)=> (
                <button key={p} className="px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200">
                  {p}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={()=>setStep(2)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold">Continuer</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">Étape 2 — Configurer le DNS</h2>
            <p className="text-gray-300 mb-4">Renseignez l'adresse DNS suivante sur votre appareil: <span className="font-mono text-white">192.168.1.31</span></p>
            <ul className="text-gray-300 list-disc ml-6 space-y-2">
              <li>Ouvrez les paramètres réseau</li>
              <li>DNS manuel → Primaire: <span className="font-mono">192.168.1.31</span></li>
              <li>Validez et redémarrez le jeu</li>
            </ul>
            <div className="mt-6 flex justify-between">
              <button onClick={()=>setStep(1)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-200 font-semibold border border-gray-600/60">Retour</button>
              <button onClick={()=>setStep(3)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold">Continuer</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-3">Étape 3 — Prêt à jouer</h2>
            <p className="text-gray-300 mb-6">Utilisez le Dashboard pour changer de région quand vous voulez.</p>
            <div className="flex justify-center gap-3">
              <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-200">Aller au Dashboard</Link>
              <Link href="/countries" className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-200 font-semibold border border-gray-600/60">Voir l'aide</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


