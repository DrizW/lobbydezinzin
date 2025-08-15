"use client";
import React, { useState, useEffect } from "react";
import Flag from "./Flag";
import { useSession } from "next-auth/react";

// Mapping des régions avec leurs informations (correspondant au VPS DNS)
const REGIONS = {
  'johannesburg': {
    name: "Johannesburg",
    flag: "🇿🇦",
    kdRange: "0.5-0.8",
    effectiveness: 98,
    description: "Lobbies ultra-faciles (Afrique du Sud)",
    color: "from-green-400 to-emerald-500"
  },
  'london': {
    name: "Londres", 
    flag: "🇬🇧",
    kdRange: "0.7-1.0",
    effectiveness: 95,
    description: "Très efficace (Royaume-Uni)",
    color: "from-blue-400 to-cyan-500"
  },
  'frankfurt': {
    name: "Francfort",
    flag: "🇩🇪",
    kdRange: "0.8-1.1",
    effectiveness: 92,
    description: "Excellent choix (Allemagne)",
    color: "from-yellow-400 to-orange-500"
  },
  'newyork': {
    name: "New York",
    flag: "🇺🇸",
    kdRange: "0.9-1.2",
    effectiveness: 90,
    description: "Très bon (États-Unis)",
    color: "from-red-400 to-pink-500"
  },
  'tokyo': {
    name: "Tokyo",
    flag: "🇯🇵",
    kdRange: "1.0-1.3",
    effectiveness: 88,
    description: "Bon (Japon)",
    color: "from-purple-400 to-indigo-500"
  }
};

type RegionKey = keyof typeof REGIONS;

interface RegionSelectorProps {
  onRegionChange?: (region: string) => void;
}

export default function RegionSelector({ onRegionChange }: RegionSelectorProps) {
  const { data: session } = useSession();
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>("johannesburg");
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
        setSelectedRegion(data.selectedCountry || "johannesburg");
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
      // Mettre à jour les paramètres utilisateur
      const settingsResponse = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedCountry: regionKey,
          autoRotate
        }),
      });

      if (settingsResponse.ok) {
        setSelectedRegion(regionKey);
        setLastUpdated(new Date().toLocaleString("fr-FR"));
        
        // Callback pour notifier le parent
        onRegionChange?.(regionKey);
        
        // Notification succès
        showNotification(`🎯 ${REGIONS[regionKey].name} ${REGIONS[regionKey].flag} activé !`, "success");
      } else {
        const error = await settingsResponse.json();
        showNotification(error.error || "Erreur lors de la sauvegarde", "error");
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
                 <span className="hidden md:inline"><Flag country={selectedRegion || currentRegion.name} size={28} /></span>
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
                      <Flag country={key || region.name} size={24} />
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