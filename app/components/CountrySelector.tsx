"use client";
import { useState, useEffect } from "react";

interface Country {
  id: string;
  name: string;
  flag: string;
  kdRange: string;
  kdValue: number;
  description: string;
  dnsPrimary: string;
  dnsSecondary: string;
  color: string;
}

const countries: Country[] = [];

export default function CountrySelector() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              SÉLECTIONNEZ
            </span>
            <span className="text-white"> VOTRE PAYS</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choisissez un pays pour accéder à des lobbies avec des KD plus bas
          </p>
        </div>

        {/* Countries Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="text-gray-400 mt-4">Chargement des pays...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {countries.map((country) => (
            <div
              key={country.id}
              onClick={() => setSelectedCountry(country)}
              className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50 cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:scale-105 group ${
                selectedCountry?.id === country.id ? "border-orange-500 ring-2 ring-orange-500/50" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{country.flag}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{country.name}</h3>
                    <p className="text-sm text-gray-400">{country.description}</p>
                  </div>
                </div>
                <div className={`text-right ${getKdColor(country.kdValue)}`}>
                  <div className="text-2xl font-bold">{country.kdRange}</div>
                  <div className="text-xs">KD moyen</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">DNS Principal:</span>
                  <span className="text-white font-mono">{country.dnsPrimary}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">DNS Secondaire:</span>
                  <span className="text-white font-mono">{country.dnsSecondary}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Difficulté:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-2 h-2 rounded-full ${
                          star <= (6 - Math.round(country.kdValue * 4)) 
                            ? "bg-green-400" 
                            : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                             </div>
             </div>
           ))}
         </div>
        )}

        {/* Selected Country Details */}
        {selectedCountry && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8 mb-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className="text-4xl">{selectedCountry.flag}</span>
                <h2 className="text-3xl font-bold text-white">{selectedCountry.name}</h2>
              </div>
              <p className="text-xl text-gray-300 mb-4">{selectedCountry.description}</p>
              <div className={`text-3xl font-bold ${getKdColor(selectedCountry.kdValue)}`}>
                KD: {selectedCountry.kdRange}
              </div>
            </div>

            {/* DNS Configuration */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Configuration DNS</h3>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">DNS Principal</span>
                      <button
                        onClick={() => copyToClipboard(selectedCountry.dnsPrimary)}
                        className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-white text-xs font-medium transition-colors"
                      >
                        Copier
                      </button>
                    </div>
                    <div className="text-white font-mono text-lg">{selectedCountry.dnsPrimary}</div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">DNS Secondaire</span>
                      <button
                        onClick={() => copyToClipboard(selectedCountry.dnsSecondary)}
                        className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-white text-xs font-medium transition-colors"
                      >
                        Copier
                      </button>
                    </div>
                    <div className="text-white font-mono text-lg">{selectedCountry.dnsSecondary}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Tutoriels de Configuration</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 px-6 py-3 rounded-lg text-white font-bold transition-all duration-300"
                  >
                    📱 PS5 - Tutoriel
                  </button>
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-3 rounded-lg text-white font-bold transition-all duration-300"
                  >
                    🎮 Xbox - Tutoriel
                  </button>
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-6 py-3 rounded-lg text-white font-bold transition-all duration-300"
                  >
                    💻 PC - Tutoriel
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {Math.round((1 - selectedCountry.kdValue) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Plus facile</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {Math.round(selectedCountry.kdValue * 10)}/10
                </div>
                <div className="text-sm text-gray-400">Difficulté</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  ⭐⭐⭐⭐⭐
                </div>
                <div className="text-sm text-gray-400">Recommandé</div>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Configuration DNS - PS5</h3>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Accédez aux Paramètres</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Allez dans Paramètres → Réseau → Paramètres de connexion
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Sélectionnez votre réseau</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Choisissez votre réseau WiFi et cliquez sur "Paramètres avancés"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Configurez le DNS</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Sélectionnez "DNS" → "Manuel" et saisissez les adresses DNS
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Saisissez les DNS</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        DNS Principal: {selectedCountry?.dnsPrimary}<br/>
                        DNS Secondaire: {selectedCountry?.dnsSecondary}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">5</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Testez la connexion</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Redémarrez votre PS5 et lancez Warzone pour tester les nouveaux lobbies !
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-bold text-green-400 mb-2">💡 Conseil</h4>
                  <p className="text-green-300 text-sm">
                    Les changements peuvent prendre quelques minutes à s'appliquer. 
                    Si vous ne voyez pas de différence immédiatement, attendez 5-10 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 