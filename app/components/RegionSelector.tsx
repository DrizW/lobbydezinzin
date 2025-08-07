"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Mapping des régions avec leurs informations (5 régions DNS Geolocation)
const REGIONS = {
  nigeria: {
    name: "Nigeria",
    flag: "🇳🇬",
    kdRange: "0.6-0.9",
    effectiveness: 95,
    description: "Lobbies ultra-faciles",
    color: "from-green-400 to-emerald-500"
  },
  taiwan: {
    name: "Taiwan", 
    flag: "🇹🇼",
    kdRange: "0.7-1.0",
    effectiveness: 92,
    description: "Très efficace",
    color: "from-blue-400 to-cyan-500"
  },
  morocco: {
    name: "Maroc",
    flag: "🇲🇦", 
    kdRange: "0.8-1.1",
    effectiveness: 90,
    description: "Excellent choix",
    color: "from-purple-400 to-pink-500"
  },
  thailand: {
    name: "Thaïlande",
    flag: "🇹🇭",
    kdRange: "0.8-1.2", 
    effectiveness: 88,
    description: "Très bon",
    color: "from-orange-400 to-red-500"
  },
  kenya: {
    name: "Kenya",
    flag: "🇰🇪",
    kdRange: "0.9-1.2",
    effectiveness: 85,
    description: "Très bon",
    color: "from-orange-400 to-yellow-500"
  }
};

type RegionKey = keyof typeof REGIONS;

interface RegionSelectorProps {
  onRegionChange?: (region: string) => void;
}

export default function RegionSelector({ onRegionChange }: RegionSelectorProps) {
  const { data: session } = useSession();
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>("nigeria");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Charger les paramètres utilisateur
  useEffect(() => {
    if (session?.user?.id) {
      loadUserSettings();
    }
  }, [session]);

  const loadUserSettings = async () => {
    try {
      const response = await fetch("/api/user/settings");
      if (response.ok) {
        const data = await response.json();
        setSelectedRegion(data.selectedCountry || "nigeria");
        setAutoRotate(data.autoRotate || false);
        setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated).toLocaleString("fr-FR") : "");
      }
    } catch (error) {
      console.error("Erreur chargement paramètres:", error);
    }
  };

  const handleRegionChange = async (regionKey: RegionKey) => {
    if (loading) return;
    
    setLoading(true);
    setIsOpen(false);

    try {
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedCountry: regionKey,
          autoRotate
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedRegion(regionKey);
        setLastUpdated(new Date().toLocaleString("fr-FR"));
        
        // Callback pour notifier le parent
        onRegionChange?.(regionKey);
        
        // Notification succès avec info geolocation spoofing
        showNotification(`🎯 ${REGIONS[regionKey].name} ${REGIONS[regionKey].flag} activé ! Géolocalisation spoofée, ping optimal maintenu.`, "success");
      } else {
        const error = await response.json();
        showNotification(error.error || "Erreur lors du changement", "error");
      }
    } catch (error) {
      console.error("Erreur changement région:", error);
      showNotification("Erreur de connexion", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    // Créer une notification temporaire
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  const currentRegion = REGIONS[selectedRegion];

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            🌍 Sélection de Région
          </h3>
          <p className="text-gray-400">
            Un seul DNS, changement de région en temps réel
          </p>
        </div>
        
        {/* Indicateur de statut */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Actif</span>
        </div>
      </div>

      {/* Région Actuelle */}
      <div className="mb-6">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 p-4 rounded-xl border border-gray-600/50 hover:border-orange-500/50 transition-all duration-300 disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{currentRegion.flag}</span>
                <div className="text-left">
                  <div className="text-white font-bold text-lg">{currentRegion.name}</div>
                  <div className="text-gray-400 text-sm">{currentRegion.description} • KD {currentRegion.kdRange}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${currentRegion.color} text-white`}>
                  {currentRegion.effectiveness}% efficace
                </div>
                
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                ) : (
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600/50 rounded-xl shadow-2xl z-10 max-h-80 overflow-y-auto">
              {Object.entries(REGIONS).map(([key, region]) => (
                <button
                  key={key}
                  onClick={() => handleRegionChange(key as RegionKey)}
                  className={`w-full p-4 text-left hover:bg-gray-700/50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                    selectedRegion === key ? 'bg-orange-500/20 border-l-4 border-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{region.flag}</span>
                      <div>
                        <div className="text-white font-medium">{region.name}</div>
                        <div className="text-gray-400 text-sm">{region.description} • KD {region.kdRange}</div>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${region.color} text-white`}>
                      {region.effectiveness}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Options avancées */}
      <div className="border-t border-gray-700/50 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-white font-medium">Rotation Intelligente</h4>
            <p className="text-gray-400 text-sm">Optimise la région selon l'heure locale (lobbies plus faciles le matin)</p>
          </div>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoRotate ? 'bg-orange-500' : 'bg-gray-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoRotate ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Informations de statut */}
        <div className="text-xs text-gray-500 space-y-1">
          {lastUpdated && <div>🕐 Dernière mise à jour: {lastUpdated}</div>}
          {autoRotate && (
            <div className="text-orange-400">🔄 Rotation active - Optimisée pour les heures creuses (6h-10h locale)</div>
          )}
        </div>
      </div>
    </div>
  );
}