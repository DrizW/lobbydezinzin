"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Logo from "./components/Logo";
import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [userStatus, setUserStatus] = useState<"loading" | "free" | "premium">("loading");

  useEffect(() => {
    if (session?.user?.id) {
      // Vérifier le statut d'abonnement
      fetch("/api/subscription/check")
        .then(res => res.json())
        .then(data => {
          setUserStatus(data.hasActiveSubscription ? "premium" : "free");
        })
        .catch(() => setUserStatus("free"));
    } else if (session === null) {
      setUserStatus("free");
    }
  }, [session]);

  const getButtonProps = () => {
    if (!session) {
      return {
        href: "/register",
        text: t('home.ctaPrimary')
      };
    }
    
    if (userStatus === "premium") {
      return {
        href: "/dashboard",
        text: "Accéder au Dashboard"
      };
    }
    
    return {
      href: "/subscription",
      text: "Passer Premium"
    };
  };

  const buttonProps = getButtonProps();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="mb-8">
              <Logo size="lg" className="mx-auto" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent">{t('home.title1')}</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent">{t('home.title2')}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={buttonProps.href}>
                <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105">
                  {buttonProps.text}
                </button>
              </Link>
              <Link href="/benefices">
                <button className="border-2 border-gray-600 hover:border-orange-500 px-8 py-4 rounded-xl text-gray-300 hover:text-orange-400 font-bold text-lg transition-all duration-300">
                  {t('home.ctaSecondary')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions (dynamiques) - uniquement pour utilisateurs connectés */}
      {session && (
        <section className="py-6">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {userStatus === "premium" ? (
                <>
                  <Link href="/dashboard">
                    <button className="w-full border-2 border-emerald-600/50 hover:border-emerald-400 text-emerald-300 hover:text-emerald-200 rounded-xl py-3 transition-all">
                      Accéder au Dashboard
                    </button>
                  </Link>
                  <Link href="/dashboard">
                    <button className="w-full border-2 border-orange-600/50 hover:border-orange-400 text-orange-300 hover:text-orange-200 rounded-xl py-3 transition-all">
                      Changer de région
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard">
                    <button className="w-full border-2 border-gray-700 hover:border-blue-500 text-gray-300 hover:text-blue-300 rounded-xl py-3 transition-all">
                      Voir le Dashboard
                    </button>
                  </Link>
                  <Link href="/benefices">
                    <button className="w-full border-2 border-gray-700 hover:border-orange-500 text-gray-300 hover:text-orange-300 rounded-xl py-3 transition-all">
                      Découvrir les fonctionnalités
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">{t('home.features.title1')}</span>
              <span className="text-white">{t('home.features.title2')}</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Contournez le SBMM et retrouvez le plaisir de jouer
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lobbies Faciles</h3>
              <p className="text-gray-300 leading-relaxed">
                Accédez à des lobbies avec des KD de 0.8-1.2 au lieu de 1.5+. 
                Plus de sweats, plus de fun !
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Pays Optimisés</h3>
              <p className="text-gray-300 leading-relaxed">
                DNS spécialisés pour plusieurs régions à faible KD. 
                Lobbies garantis !
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Configuration Simple</h3>
              <p className="text-gray-300 leading-relaxed">
                Tutoriels simples pour PS5, Xbox et PC. Changez de pays 
                en quelques clics et profitez de lobbies plus faciles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section id="locations" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                PAYS
              </span>
              <span className="text-white"> DISPONIBLES</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choisissez votre pays pour des lobbies avec des KD plus bas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 text-center group hover:border-blue-500/50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">🇳🇬</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Nigeria</h3>
              <p className="text-gray-300 mb-4">Lobbies ultra-faciles</p>
              <div className="text-green-400 font-bold">KD: 0.6-0.9</div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 text-center group hover:border-blue-500/50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">🇹🇼</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Taiwan</h3>
              <p className="text-gray-300 mb-4">Lobbies très faciles</p>
              <div className="text-green-400 font-bold">KD: 0.7-1.0</div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 text-center group hover:border-blue-500/50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">🇿🇦</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Afrique du Sud</h3>
              <p className="text-gray-300 mb-4">Johannesburg - Actif</p>
              <div className="text-green-400 font-bold">KD: 0.5-0.8</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show for non-logged users */}
      {!session && (
        <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                PRÊT À
              </span>
              <span className="text-white"> JOUER FACILE ?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Rejoignez des milliers de joueurs qui ont déjà contourné le SBMM
            </p>
            <Link href="/register">
              <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-10 py-4 rounded-xl text-white font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105">
                {t('home.ctaPrimary')}
              </button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
} 