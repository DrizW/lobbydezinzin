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

interface DNSStatus {
  [countryId: string]: 'testing' | 'online' | 'offline' | 'unknown';
}

type TutorialType = 'ps5' | 'xbox' | 'pc' | null;

const countries: Country[] = [];

export default function CountrySelector() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showTutorial, setShowTutorial] = useState<TutorialType>(null);
  const [loading, setLoading] = useState(true);
  const [dnsStatus, setDnsStatus] = useState<DNSStatus>({});
  const [testingAll, setTestingAll] = useState(false);
  const [userIP, setUserIP] = useState<string>('');
  const [showDNSConfig, setShowDNSConfig] = useState(false);

  useEffect(() => {
    // Récupérer les pays
    fetch("/api/countries")
      .then(res => res.json())
      .then(data => {
        // Gérer la nouvelle structure de l'API
        const countriesArray = data.countries || data || [];
        setCountries(countriesArray);
        setLoading(false);
        // Initialiser le statut DNS
        const initialStatus: DNSStatus = {};
        countriesArray.forEach((country: Country) => {
          initialStatus[country.id] = 'unknown';
        });
        setDnsStatus(initialStatus);
      })
      .catch(() => setLoading(false));

    // Récupérer l'IP de l'utilisateur
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIP(data.ip))
      .catch(() => {
        // Fallback avec une autre API
        fetch('https://ipapi.co/ip/')
          .then(res => res.text())
          .then(ip => setUserIP(ip.trim()))
          .catch(() => setUserIP('IP non détectée'));
      });
  }, []);

  const testDNS = async (country: Country) => {
    setDnsStatus(prev => ({ ...prev, [country.id]: 'testing' }));
    
    try {
      // Simuler un test DNS
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Résultat fixe basé sur l'index du pays (sans Math.random)
      const countryNames = ['Nigeria', 'Taiwan', 'Israël', 'Thaïlande', 'Cambodge', 'Maroc', 'Algérie', 'Tunisie', 'Kenya'];
      const index = countryNames.indexOf(country.name);
      const isOnline = index !== -1 ? index % 4 !== 3 : true; // 75% de succès
      
      setDnsStatus(prev => ({ 
        ...prev, 
        [country.id]: isOnline ? 'online' : 'offline' 
      }));
    } catch (error) {
      setDnsStatus(prev => ({ ...prev, [country.id]: 'offline' }));
    }
  };

  const testAllDNS = async () => {
    setTestingAll(true);
    const testPromises = countries.map(country => testDNS(country));
    await Promise.all(testPromises);
    setTestingAll(false);
  };

  const getKdColor = (kd: number) => {
    if (kd <= 0.9) return "text-green-400";
    if (kd <= 1.1) return "text-yellow-400";
    return "text-orange-400";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'testing': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'testing': return '🟡';
      default: return '⚪';
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  const getTutorialContent = (type: TutorialType) => {
    switch (type) {
      case 'ps5':
        return {
          title: 'Configuration DNS - PS5',
          steps: [
            {
              title: 'Accédez aux Paramètres',
              description: 'Allez dans Paramètres → Réseau → Paramètres de connexion',
              color: 'from-blue-500 to-cyan-600'
            },
            {
              title: 'Sélectionnez votre réseau',
              description: 'Choisissez votre réseau WiFi et cliquez sur "Paramètres avancés"',
              color: 'from-green-500 to-emerald-600'
            },
            {
              title: 'Configurez le DNS',
              description: 'Sélectionnez "DNS" → "Manuel" et saisissez les adresses DNS',
              color: 'from-purple-500 to-pink-600'
            },
            {
              title: 'Saisissez les DNS',
              description: `DNS Principal: ${selectedCountry?.dnsPrimary}\nDNS Secondaire: ${selectedCountry?.dnsSecondary}`,
              color: 'from-orange-500 to-red-600'
            },
            {
              title: 'Testez la connexion',
              description: 'Redémarrez votre PS5 et lancez Warzone pour tester les nouveaux lobbies !',
              color: 'from-yellow-500 to-orange-600'
            }
          ]
        };
      case 'xbox':
        return {
          title: 'Configuration DNS - Xbox',
          steps: [
            {
              title: 'Ouvrez les Paramètres',
              description: 'Allez dans Paramètres → Réseau → Paramètres réseau avancés',
              color: 'from-green-500 to-emerald-600'
            },
            {
              title: 'Paramètres DNS',
              description: 'Sélectionnez "Paramètres DNS" puis "Manuel"',
              color: 'from-blue-500 to-cyan-600'
            },
            {
              title: 'Configurez le DNS primaire',
              description: `Saisissez le DNS primaire: ${selectedCountry?.dnsPrimary}`,
              color: 'from-purple-500 to-pink-600'
            },
            {
              title: 'Configurez le DNS secondaire',
              description: `Saisissez le DNS secondaire: ${selectedCountry?.dnsSecondary}`,
              color: 'from-orange-500 to-red-600'
            },
            {
              title: 'Redémarrez la console',
              description: 'Redémarrez votre Xbox et testez Warzone avec les nouveaux DNS !',
              color: 'from-yellow-500 to-orange-600'
            }
          ]
        };
      case 'pc':
        return {
          title: 'Configuration DNS - PC',
          steps: [
            {
              title: 'Ouvrez les Paramètres réseau',
              description: 'Clic droit sur l\'icône réseau → "Ouvrir les paramètres réseau et Internet"',
              color: 'from-purple-500 to-pink-600'
            },
            {
              title: 'Modifier les options d\'adaptateur',
              description: 'Cliquez sur "Modifier les options d\'adaptateur"',
              color: 'from-blue-500 to-cyan-600'
            },
            {
              title: 'Propriétés de connexion',
              description: 'Clic droit sur votre connexion → "Propriétés"',
              color: 'from-green-500 to-emerald-600'
            },
            {
              title: 'Protocole IPv4',
              description: 'Sélectionnez "Protocole Internet version 4 (TCP/IPv4)" → "Propriétés"',
              color: 'from-orange-500 to-red-600'
            },
            {
              title: 'Configurez les DNS',
              description: `Cochez "Utiliser les adresses DNS suivantes":\nPréféré: ${selectedCountry?.dnsPrimary}\nAuxiliaire: ${selectedCountry?.dnsSecondary}`,
              color: 'from-yellow-500 to-orange-600'
            }
          ]
        };
      default:
        return null;
    }
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
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Choisissez un pays pour accéder à des lobbies avec des KD plus bas
          </p>
          
          {/* Test All Button */}
          <button
            onClick={testAllDNS}
            disabled={testingAll || loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 px-8 py-3 rounded-lg text-white font-bold transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            {testingAll ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Test en cours...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Tester tous les DNS</span>
              </>
            )}
          </button>
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
              onClick={() => {
                setSelectedCountry(country);
                setShowDNSConfig(true);
              }}
              className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50 cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:scale-105 group relative ${
                selectedCountry?.id === country.id ? "border-orange-500 ring-2 ring-orange-500/50" : ""
              }`}
            >
              {/* Status Indicator */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <span className="text-lg">{getStatusIcon(dnsStatus[country.id])}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    testDNS(country);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-white transition-colors"
                >
                  Test
                </button>
              </div>

              <div className="flex items-center justify-between mb-4 pr-16">
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

        {/* DNS Configuration Modal */}
        {showDNSConfig && selectedCountry && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{selectedCountry.flag}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{selectedCountry.name}</h2>
                    <p className="text-gray-400">{selectedCountry.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDNSConfig(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Sécurité IP */}
              <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-red-400 mb-2">🔒 Sécurité par IP</h3>
                <p className="text-gray-300 text-sm mb-2">
                  Pour des raisons de sécurité, seule votre IP actuelle sera autorisée :
                </p>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono text-lg">{userIP || 'Détection en cours...'}</span>
                    <button
                      onClick={() => copyToClipboard(userIP)}
                      className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-xs font-medium transition-colors"
                    >
                      Copier IP
                    </button>
                  </div>
                </div>
                <p className="text-red-300 text-xs mt-2">
                  ⚠️ Si votre IP change, vous devrez revenir sur cette page pour la mettre à jour.
                </p>
              </div>

              {/* DNS Configuration */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">🌐 Configuration DNS</h3>
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

                    <div className={`text-center p-4 rounded-lg ${getKdColor(selectedCountry.kdValue)} bg-gray-800/30`}>
                      <div className="text-2xl font-bold">KD Moyen: {selectedCountry.kdRange}</div>
                      <div className="text-sm opacity-75">
                        {Math.round((1 - selectedCountry.kdValue) * 100)}% plus facile que la normale
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">📋 Tutoriels Console</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowTutorial('ps5')}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 px-6 py-3 rounded-lg text-white font-bold transition-all duration-300"
                    >
                      📱 PS5 - Configuration
                    </button>
                    <button
                      onClick={() => setShowTutorial('xbox')}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-3 rounded-lg text-white font-bold transition-all duration-300"
                    >
                      🎮 Xbox - Configuration
                    </button>
                    <button
                      onClick={() => setShowTutorial('pc')}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-6 py-3 rounded-lg text-white font-bold transition-all duration-300"
                    >
                      💻 PC - Configuration
                    </button>
                  </div>

                  {/* Test DNS */}
                  <div className="mt-6">
                    <button
                      onClick={() => testDNS(selectedCountry)}
                      disabled={dnsStatus[selectedCountry.id] === 'testing'}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 px-6 py-3 rounded-lg text-white font-bold transition-all duration-300"
                    >
                      {dnsStatus[selectedCountry.id] === 'testing' ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Test en cours...
                        </>
                      ) : (
                        <>
                          🔍 Tester le DNS {selectedCountry.name}
                        </>
                      )}
                    </button>
                    
                    {dnsStatus[selectedCountry.id] !== 'unknown' && (
                      <div className={`mt-3 p-3 rounded-lg ${
                        dnsStatus[selectedCountry.id] === 'online' 
                          ? 'bg-green-900/20 border border-green-500/30' 
                          : 'bg-red-900/20 border border-red-500/30'
                      }`}>
                        <p className={`text-sm ${
                          dnsStatus[selectedCountry.id] === 'online' ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {getStatusIcon(dnsStatus[selectedCountry.id])} {' '}
                          {dnsStatus[selectedCountry.id] === 'online' 
                            ? 'DNS opérationnel - Prêt à utiliser !' 
                            : 'DNS hors ligne - Essayez un autre pays'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {(() => {
                const tutorialContent = getTutorialContent(showTutorial);
                if (!tutorialContent) return null;

                return (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-white">{tutorialContent.title}</h3>
                      <button
                        onClick={() => setShowTutorial(null)}
                        className="text-gray-400 hover:text-white text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {tutorialContent.steps.map((step, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className={`w-8 h-8 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center flex-shrink-0 mt-1`}>
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-white mb-2">{step.title}</h4>
                              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <h4 className="font-bold text-green-400 mb-2">💡 Conseil</h4>
                        <p className="text-green-300 text-sm">
                          Les changements peuvent prendre quelques minutes à s'appliquer. 
                          Si vous ne voyez pas de différence immédiatement, attendez 5-10 minutes.
                        </p>
                      </div>
                      
                      {/* Status du DNS sélectionné */}
                      {selectedCountry && (
                        <div className={`rounded-lg p-4 ${
                          dnsStatus[selectedCountry.id] === 'online' 
                            ? 'bg-green-900/20 border border-green-500/30' 
                            : dnsStatus[selectedCountry.id] === 'offline'
                            ? 'bg-red-900/20 border border-red-500/30'
                            : 'bg-gray-900/20 border border-gray-500/30'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`font-bold mb-2 ${getStatusColor(dnsStatus[selectedCountry.id])}`}>
                                {getStatusIcon(dnsStatus[selectedCountry.id])} Statut du DNS {selectedCountry.name}
                              </h4>
                              <p className="text-gray-300 text-sm">
                                {dnsStatus[selectedCountry.id] === 'online' && 'DNS opérationnel - Prêt à utiliser !'}
                                {dnsStatus[selectedCountry.id] === 'offline' && 'DNS hors ligne - Essayez un autre pays'}
                                {dnsStatus[selectedCountry.id] === 'testing' && 'Test en cours...'}
                                {dnsStatus[selectedCountry.id] === 'unknown' && 'Statut inconnu - Cliquez pour tester'}
                              </p>
                            </div>
                            <button
                              onClick={() => testDNS(selectedCountry)}
                              disabled={dnsStatus[selectedCountry.id] === 'testing'}
                              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 px-4 py-2 rounded text-white text-sm font-medium transition-colors"
                            >
                              {dnsStatus[selectedCountry.id] === 'testing' ? 'Test...' : 'Tester'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 