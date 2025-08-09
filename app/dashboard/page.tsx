"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ClientOnly from "../components/ClientOnly";
import RegionSelector from "../components/RegionSelector";
import Image from "next/image";
import {useTranslations} from 'next-intl';

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
  const t = useTranslations();
  const { data: session } = useSession();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requiresSubscription, setRequiresSubscription] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string>("");
  const [currentRegion, setCurrentRegion] = useState<string>("south-africa");
  const [regionStats, setRegionStats] = useState({
    name: "Afrique du Sud",
    flag: "🇿🇦",
    kdAverage: 0.65,
    lobbiesTested: 28,
    kdRange: "0.5-0.8",
    timezone: "Africa/Johannesburg",
    localTime: "12:00"
  });

  useEffect(() => {
    checkAccess();
    loadUserRegion();
    const timeInterval = setInterval(() => { updateRegionStats(currentRegion); }, 60000);
    return () => clearInterval(timeInterval);
  }, [currentRegion]);

  const loadUserRegion = async () => {
    try {
      const response = await fetch("/api/user/settings");
      if (response.ok) {
        const data = await response.json();
        const userRegion = data.selectedCountry || "south-africa";
        setCurrentRegion(userRegion);
        updateRegionStats(userRegion);
      }
    } catch (error) {
      console.error("Erreur chargement région:", error);
    }
  };

  const checkAccess = async () => {
    try {
      const response = await fetch("/api/subscription/check");
      if (response.ok) {
        const data = await response.json();
        setHasAccess(data.hasAccess);
        setRequiresSubscription(!data.hasAccess);
        if (!data.hasAccess) setAccessMessage(t('dash.premium.required'));
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
    updateRegionStats(region);
  };

  const fetchDynamicStats = async (region: string) => {
    try {
      const res = await fetch(`/api/stats/region?key=${encodeURIComponent(region)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { return null; }
  };

  const updateRegionStats = async (region: string) => {
    const regionData = {
      'south-africa': { name: "Afrique du Sud", flag: "/flags/za.svg", kdAverage: 0.65, lobbiesTested: 28, kdRange: "0.5-0.8", timezone: "Africa/Johannesburg" },
      nigeria: { name: "Nigeria", flag: "/flags/ng.svg", kdAverage: 0.75, lobbiesTested: 24, kdRange: "0.6-0.9", timezone: "Africa/Lagos" },
      taiwan: { name: "Taiwan", flag: "/flags/tw.svg", kdAverage: 0.85, lobbiesTested: 18, kdRange: "0.7-1.0", timezone: "Asia/Taipei" },
      morocco: { name: "Maroc", flag: "/flags/ma.svg", kdAverage: 0.95, lobbiesTested: 21, kdRange: "0.8-1.1", timezone: "Africa/Casablanca" },
      thailand: { name: "Thaïlande", flag: "/flags/th.svg", kdAverage: 1.0, lobbiesTested: 15, kdRange: "0.8-1.2", timezone: "Asia/Bangkok" },
      kenya: { name: "Kenya", flag: "/flags/ke.svg", kdAverage: 1.05, lobbiesTested: 17, kdRange: "0.9-1.2", timezone: "Africa/Nairobi" },
    } as const;

    const fallback = regionData[region as keyof typeof regionData] || regionData['south-africa'];
    const dynamic = await fetchDynamicStats(region);
    if (dynamic) {
      setRegionStats({
        name: dynamic.name ?? fallback.name,
        flag: dynamic.flag ?? fallback.flag,
        kdAverage: dynamic.kdAverage ?? fallback.kdAverage,
        lobbiesTested: dynamic.lobbiesTested ?? fallback.lobbiesTested,
        kdRange: dynamic.kdRange ?? fallback.kdRange,
        timezone: dynamic.timezone ?? fallback.timezone,
        localTime: dynamic.localTime ?? new Intl.DateTimeFormat('fr-FR', { timeZone: fallback.timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
      });
      return;
    }
    setRegionStats({ ...fallback, localTime: getLocalTime(fallback.timezone) });
  };

  const getLocalTime = (timezone: string) => {
    const now = new Date();
    return new Intl.DateTimeFormat('fr-FR', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  };

  const getTimeStatus = (timezone: string) => {
    const now = new Date();
    const hour = parseInt(now.toLocaleString('en-US', { timeZone: timezone, hour12: false, hour: '2-digit' }));
    if (hour >= 6 && hour <= 10) return { text: "Optimal (Matin)", color: "text-green-400", icon: "🌅" };
    if (hour >= 11 && hour <= 15) return { text: "Bon (Midi)", color: "text-yellow-400", icon: "☀️" };
    if (hour >= 16 && hour <= 21) return { text: "Moyen (Soir)", color: "text-orange-400", icon: "🌆" };
    return { text: "Difficile (Nuit)", color: "text-red-400", icon: "🌙" };
  };

  const getKdColor = (kd: number) => { if (kd <= 0.9) return "text-green-400"; if (kd <= 1.1) return "text-yellow-400"; return "text-orange-400"; };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-12 relative">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">{t('dash.title').split(' ')[0]}</span>
            <span className="text-white"> {t('dash.title').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">{t('dash.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('dash.currentCountry')}</p>
                <p className="text-2xl font-bold text-green-400">{regionStats.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-500">🕐 {regionStats.localTime}</p>
                  <span className="text-xs">•</span>
                  <p className={`text-xs font-medium ${getTimeStatus(regionStats.timezone).color}`}>
                    {getTimeStatus(regionStats.timezone).icon} {getTimeStatus(regionStats.timezone).text}
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center overflow-hidden">
                <Image src={typeof regionStats.flag === 'string' && regionStats.flag.startsWith('/flags') ? (regionStats.flag as any) : '/flags/za.svg'} alt={regionStats.name} width={28} height={20} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('dash.kdAverage')}</p>
                <p className={`text-2xl font-bold ${getKdColor(regionStats.kdAverage)}`}>{regionStats.kdAverage}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('dash.lobbiesTested')}</p>
                <p className="text-2xl font-bold text-orange-400">{regionStats.lobbiesTested}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">{t('dash.selection.title1')}</span>
            <span className="text-white">{t('dash.selection.title2')}</span>
          </h2>

          {requiresSubscription && (
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6 mb-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">🔒 {t('dash.premium.required')}</h3>
              <p className="text-gray-300 mb-4">{accessMessage}</p>
              <Link href="/subscription"><button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-3 rounded-xl text-white font-bold transition-all duration-300 shadow-lg hover:shadow-orange-500/25 transform hover:scale-105">🚀 {t('dash.premium.cta')}</button></Link>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div><p className="text-gray-400 mt-4">Chargement...</p></div>
          ) : hasAccess ? (
            <div className="grid lg:grid-cols-2 gap-8">
              <RegionSelector onRegionChange={handleRegionChange} />
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6">
                <h3 className="text-2xl font-bold text-white mb-4">⚙️ {t('dash.uniqueSetup')}</h3>
                <p className="text-gray-400 mb-6">{t('dash.uniqueSetup.desc')}</p>
                {/* DNS bloc conservé */}
              </div>
            </div>
          ) : (
            <div className="text-center py-12"><div className="text-red-400 text-lg">{accessMessage}</div></div>
          )}
        </div>
      </div>
    </div>
    </ClientOnly>
  );
} 