"use client";
import React, { useEffect, useState } from "react";

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



  return (
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
              SERVEURS DNS
            </span>
            <span className="text-white"> DISPONIBLES</span>
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="text-gray-400 mt-4">Chargement des serveurs...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {continents.map(continent => {
                const servers = dnsServers.filter(s => s.continent === continent);
                if (servers.length === 0) return null;

                return (
                  <div key={continent} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 overflow-hidden">
                    <div className={`bg-gradient-to-r ${getContinentColor(continent)} p-6`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{getContinentIcon(continent)}</span>
                        <h3 className="text-2xl font-bold text-white">{continent}</h3>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium text-white">
                          {servers.length} serveur{servers.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {servers.map(server => (
                          <div key={server.ip} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 hover:border-orange-500/50 transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-orange-400 font-mono text-sm">{server.ip}</span>
                              <button 
                                onClick={() => navigator.clipboard.writeText(server.ip)}
                                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-3 py-1 rounded-lg text-white text-xs font-medium transition-all duration-200 opacity-0 group-hover:opacity-100"
                              >
                                Copier
                              </button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-gray-400 text-sm">En ligne</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
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
  );
} 