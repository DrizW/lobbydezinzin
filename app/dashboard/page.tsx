"use client";
import React, { useEffect, useState } from "react";
import ClientOnly from "../components/ClientOnly";

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
};

export default function DashboardPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/countries")
      .then(res => res.json())
      .then(data => {
        setCountries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              MON
            </span>
            <span className="text-white"> DASHBOARD</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Gérez vos DNS et accédez à des lobbies plus faciles
          </p>
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

        {/* DNS Servers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              PAYS
            </span>
            <span className="text-white"> DISPONIBLES</span>
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="text-gray-400 mt-4">Chargement des pays...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {countries.map(country => (
                <div key={country.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6 hover:border-orange-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{country.name}</h3>
                        <p className="text-sm text-gray-400">{country.description}</p>
                      </div>
                    </div>
                    <div className={`text-right ${getKdColor(country.kdValue)}`}>
                      <div className="text-lg font-bold">{country.kdRange}</div>
                      <div className="text-xs">KD moyen</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">DNS Principal:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono">{country.dnsPrimary}</span>
                        <button
                          onClick={() => navigator.clipboard?.writeText(country.dnsPrimary)}
                          className="bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded text-white text-xs transition-colors"
                        >
                          Copier
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">DNS Secondaire:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono">{country.dnsSecondary}</span>
                        <button
                          onClick={() => navigator.clipboard?.writeText(country.dnsSecondary)}
                          className="bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded text-white text-xs transition-colors"
                        >
                          Copier
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Statut:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-sm">En ligne</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Setup Guide */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              GUIDE DE
            </span>
            <span className="text-white"> CONFIGURATION RAPIDE</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">PS5</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Paramètres → Réseau → Configurer DNS → Saisir l'IP ci-dessus
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Xbox</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Paramètres → Réseau → DNS personnalisé → Saisir l'IP ci-dessus
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">PC</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Paramètres réseau → Propriétés → DNS → Saisir l'IP ci-dessus
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Test</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Redémarrez votre console/PC et testez votre connexion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ClientOnly>
  );
} 