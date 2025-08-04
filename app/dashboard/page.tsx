"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ClientOnly from "../components/ClientOnly";
import RegionSelector from "../components/RegionSelector";

type Country = {
  id: string;
  name: string;
  flag: string;
  kdRange: string;
  kdValue: number;
  description: string;
  dnsPrimary: string;
  dnsSecondary: string;
  color: string;
  isPremium?: boolean;
};

type CountriesResponse = {
  countries: Country[];
  requiresSubscription: boolean;
  hasAccess: boolean;
  message?: string;
  error?: string;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requiresSubscription, setRequiresSubscription] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string>("");
  const [currentRegion, setCurrentRegion] = useState<string>("nigeria");

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const response = await fetch("/api/subscription/check");
      if (response.ok) {
        const data = await response.json();
        setHasAccess(data.hasAccess);
        setRequiresSubscription(!data.hasAccess);
        if (!data.hasAccess) {
          setAccessMessage("Abonnement Premium requis pour changer de région");
        }
      } else {
        setRequiresSubscription(true);
        setAccessMessage("Authentification requise");
      }
    } catch (error) {
      console.error("Erreur vérification accès:", error);
      setRequiresSubscription(true);
      setAccessMessage("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (region: string) => {
    setCurrentRegion(region);
  };

  const getKdColor = (kd: number) => {
    if (kd <= 0.9) return "text-green-400";
    if (kd <= 1.1) return "text-yellow-400";
    return "text-orange-400";
  };



  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12 relative">
          {/* Bouton Admin (visible seulement pour les admins) */}
          {session?.user?.role === "ADMIN" && (
            <div className="absolute right-0 top-0">
              <Link href="/admin">
                <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-6 py-3 rounded-xl text-white font-bold transition-all duration-300 shadow-lg">
                  👑 Panel Admin
                </button>
              </Link>
            </div>
          )}
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              MON
            </span>
            <span className="text-white"> DASHBOARD</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Gérez vos DNS et accédez à des lobbies plus faciles
          </p>
          
          {session?.user?.role === "ADMIN" && (
            <div className="mt-4 text-center">
              <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 px-4 py-2 rounded-full text-purple-300 text-sm">
                👑 Compte Administrateur
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pays Actuel</p>
                <p className="text-2xl font-bold text-green-400">Nigeria</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🇳🇬</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">KD Moyen</p>
                <p className="text-2xl font-bold text-blue-400">0.75</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Lobbies Testés</p>
                <p className="text-2xl font-bold text-orange-400">24</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Region System */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              SÉLECTION DE
            </span>
            <span className="text-white"> RÉGION</span>
          </h2>

          {/* Message d'abonnement requis */}
          {requiresSubscription && (
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6 mb-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2zm10-12V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">🔒 Abonnement Premium Requis</h3>
              <p className="text-gray-300 mb-4">{accessMessage}</p>
              <Link href="/subscription">
                <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-3 rounded-xl text-white font-bold transition-all duration-300 shadow-lg hover:shadow-orange-500/25 transform hover:scale-105">
                  🚀 S'abonner Maintenant
                </button>
              </Link>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="text-gray-400 mt-4">Chargement...</p>
            </div>
          ) : hasAccess ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Sélecteur de région */}
              <RegionSelector onRegionChange={handleRegionChange} />
              
              {/* Configuration DNS unique */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                  ⚙️ Configuration Unique
                </h3>
                <p className="text-gray-400 mb-6">
                  Configurez une seule fois ce DNS sur votre console, puis changez de région via l'interface web !
                </p>
                
                <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-400 text-sm">DNS Principal</div>
                      <div className="text-white font-mono text-xl">192.168.1.100</div>
                      <div className="text-gray-500 text-xs mt-1">Votre serveur DNS intelligent</div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard?.writeText("192.168.1.100")}
                      className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                    >
                      📋 Copier
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Configuration Console/PC</h4>
                      <p className="text-gray-300 text-sm">Utilisez le DNS ci-dessus dans vos paramètres réseau</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Changement de Région</h4>
                      <p className="text-gray-300 text-sm">Sélectionnez votre région via l'interface web (à gauche)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Effet Immédiat</h4>
                      <p className="text-gray-300 text-sm">Les nouveaux lobbies utilisent automatiquement la région choisie</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-blue-400">💡</span>
                    <span className="text-blue-300 font-semibold">Avantages</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Plus besoin de reconfigurer votre console</li>
                    <li>• Changement de région en temps réel</li>
                    <li>• Interface web intuitive</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-red-400 text-lg">{accessMessage}</div>
            </div>
          )}
        </div>

        {/* Smart DNS Setup Guide */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              SYSTÈME INTELLIGENT
            </span>
            <span className="text-white"> NOLAG STYLE</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚙️</span>
              </div>
              <h4 className="font-bold text-white mb-2">1. Configuration Unique</h4>
              <p className="text-gray-300 text-sm">
                Configurez <strong>192.168.1.100</strong> comme DNS sur votre console une seule fois
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🌍</span>
              </div>
              <h4 className="font-bold text-white mb-2">2. Changement Web</h4>
              <p className="text-gray-300 text-sm">
                Utilisez l'interface web pour changer de région sans toucher à votre console
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🚀</span>
              </div>
              <h4 className="font-bold text-white mb-2">3. Effet Immédiat</h4>
              <p className="text-gray-300 text-sm">
                Les nouveaux lobbies utilisent automatiquement votre région choisie
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">✨</span>
              <h4 className="text-xl font-bold text-white">Exactement comme NolagVPN !</h4>
            </div>
            <ul className="text-gray-300 space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Un seul DNS à configurer</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Changement de région depuis l'interface web</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Pas besoin de reconfigurer votre console</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Effet instantané sur les lobbies</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </ClientOnly>
  );
} 