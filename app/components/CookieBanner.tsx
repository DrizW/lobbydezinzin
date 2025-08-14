'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  performance: boolean;
  preferences: boolean;
}

export default function CookieBanner() {
  const { data: session } = useSession();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    performance: false,
    preferences: false
  });
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ldz_session_id') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return '';
  });

  useEffect(() => {
    // Sauvegarder le sessionId
    if (typeof window !== 'undefined' && sessionId) {
      localStorage.setItem('ldz_session_id', sessionId);
    }

    // Vérifier si le consentement existe déjà
    const hasConsent = localStorage.getItem('ldz_cookie_consent');
    if (!hasConsent) {
      setShowBanner(true);
    } else {
      // Charger les préférences existantes
      try {
        const savedPreferences = JSON.parse(hasConsent);
        setPreferences(savedPreferences);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const saveConsent = async (prefs: CookiePreferences) => {
    try {
      const response = await fetch('/api/cookies/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...prefs,
          sessionId: sessionId
        })
      });

      if (response.ok) {
        localStorage.setItem('ldz_cookie_consent', JSON.stringify(prefs));
        setShowBanner(false);
        setShowPreferences(false);
        
        // Déclencher un événement pour informer l'application
        window.dispatchEvent(new CustomEvent('cookie-consent-updated', { 
          detail: prefs 
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du consentement:', error);
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      performance: true,
      preferences: true
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const handleAcceptEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      performance: false,
      preferences: false
    };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Bannière principale */}
      {!showPreferences && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 p-4 z-50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">🍪 Gestion des cookies</h3>
              <p className="text-gray-300 text-sm">
                Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. 
                Vous pouvez choisir quels types de cookies accepter.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
              >
                Préférences
              </button>
              <button
                onClick={handleAcceptEssential}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
              >
                Essentiels uniquement
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal des préférences détaillées */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Préférences de cookies</h2>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Cookies essentiels */}
                <div className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold">🍪 Cookies essentiels</h3>
                      <p className="text-gray-400 text-sm">Nécessaires au fonctionnement du site</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 text-sm mr-2">Toujours actifs</span>
                      <div className="w-10 h-6 bg-green-600 rounded-full flex items-center justify-end px-1">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Ces cookies sont nécessaires pour le fonctionnement du site web et ne peuvent pas être désactivés.
                    Ils incluent les cookies de session, d'authentification et de sécurité.
                  </p>
                </div>

                {/* Cookies d'analyse */}
                <div className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold">📊 Cookies d'analyse</h3>
                      <p className="text-gray-400 text-sm">Nous aident à comprendre comment vous utilisez le site</p>
                    </div>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                      className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                        preferences.analytics ? 'bg-orange-600 justify-end' : 'bg-gray-600 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Ces cookies nous permettent de mesurer le trafic et d'analyser les performances du site 
                    pour améliorer votre expérience.
                  </p>
                </div>

                {/* Cookies de performance */}
                <div className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold">⚡ Cookies de performance</h3>
                      <p className="text-gray-400 text-sm">Améliorent les performances du site</p>
                    </div>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, performance: !prev.performance }))}
                      className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                        preferences.performance ? 'bg-orange-600 justify-end' : 'bg-gray-600 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Ces cookies permettent d'optimiser les performances du site en mémorisant 
                    vos préférences et en accélérant le chargement des pages.
                  </p>
                </div>

                {/* Cookies de préférences */}
                <div className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold">⚙️ Cookies de préférences</h3>
                      <p className="text-gray-400 text-sm">Mémorisent vos choix et préférences</p>
                    </div>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, preferences: !prev.preferences }))}
                      className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                        preferences.preferences ? 'bg-orange-600 justify-end' : 'bg-gray-600 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Ces cookies mémorisent vos préférences comme la langue, la région ou les paramètres d'affichage 
                    pour personnaliser votre expérience.
                  </p>
                </div>

                {/* Cookies marketing */}
                <div className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold">🎯 Cookies marketing</h3>
                      <p className="text-gray-400 text-sm">Utilisés pour la publicité ciblée</p>
                    </div>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                      className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                        preferences.marketing ? 'bg-orange-600 justify-end' : 'bg-gray-600 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Ces cookies sont utilisés pour vous proposer des contenus et publicités 
                    pertinents selon vos intérêts.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAcceptEssential}
                  className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
                >
                  Essentiels uniquement
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex-1"
                >
                  Enregistrer mes préférences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


