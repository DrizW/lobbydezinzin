"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Logo from "./Logo";
import {useTranslations} from 'next-intl';

export default function Header() {
  const { data: session, status } = useSession();
  const t = useTranslations();

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => { signOut({ callbackUrl: "/" }); };

  const switchLocale = (locale: 'fr'|'en') => {
    try { document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; } catch {}
    window.location.reload();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) setShowAccountMenu(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) setShowMobileMenu(false);
      if (langMenuRef.current && !langMenuRef.current.contains(target)) setShowLangMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 shadow-2xl sticky top-0 z-30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <Logo size="md" />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/benefices" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium">
              {t("nav.benefits")}
            </Link>
            <Link href="/countries" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium">
              {t("nav.help")}
            </Link>

            {/* Language dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button onClick={() => setShowLangMenu(v=>!v)} className="text-gray-300 hover:text-white px-3 py-2 border border-gray-700 rounded-lg flex items-center gap-2">
                <span>🌐</span>
                <span className="text-sm">Langue</span>
                <svg className={`w-4 h-4 ${showLangMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                  <button onClick={() => switchLocale('fr')} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700">Français</button>
                  <button onClick={() => switchLocale('en')} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700">English</button>
                </div>
              )}
            </div>
            
            {status === "loading" ? (
              <div className="bg-gray-700 px-4 py-2 rounded-lg text-gray-300 animate-pulse">Chargement...</div>
            ) : session ? (
              <div className="relative" ref={accountMenuRef}>
                <button onClick={() => setShowAccountMenu(v => !v)} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {session.user?.email || "Mon compte"}
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showAccountMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </button>
                {showAccountMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 py-2 z-50">
                    <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200" onClick={() => setShowAccountMenu(false)}>Dashboard</Link>
                    <Link href="/countries" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200" onClick={() => setShowAccountMenu(false)}>{t("nav.help")}</Link>
                    <Link href="/contact" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200" onClick={() => setShowAccountMenu(false)}>{t("nav.contact")}</Link>
                    {session.user?.role === "ADMIN" && (<Link href="/admin" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200" onClick={() => setShowAccountMenu(false)}>{t("nav.admin")}</Link>)}
                    <div className="border-t border-gray-700/50 my-2"></div>
                    <button onClick={handleSignOut} className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200">{t("nav.logout")}</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"><button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl">{t("nav.login")}</button></Link>
            )}
          </nav>

          {/* Menu mobile */}
          <div className="md:hidden" ref={mobileMenuRef}>
            <button onClick={() => setShowMobileMenu(v => !v)} className="text-gray-300 hover:text-orange-400 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            {showMobileMenu && (
              <div className="absolute right-4 top-16 w-64 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 py-2 z-50">
                <Link href="/benefices" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200" onClick={() => setShowMobileMenu(false)}>{t("nav.benefits")}</Link>
                <Link href="/countries" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200" onClick={() => setShowMobileMenu(false)}>{t("nav.help")}</Link>
                <Link href="/contact" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200" onClick={() => setShowMobileMenu(false)}>{t("nav.contact")}</Link>
                <div className="border-t border-gray-700/50 my-2"></div>
                {/* Mobile language quick actions */}
                <button onClick={() => {switchLocale('fr'); setShowMobileMenu(false);}} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700">Français</button>
                <button onClick={() => {switchLocale('en'); setShowMobileMenu(false);}} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700">English</button>
                <div className="border-t border-gray-700/50 my-2"></div>
                {session ? (
                  <>
                    <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200" onClick={() => setShowMobileMenu(false)}>Dashboard</Link>
                    {session.user?.role === "ADMIN" && (<Link href="/admin" className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200" onClick={() => setShowMobileMenu(false)}>{t("nav.admin")}</Link>)}
                    <div className="border-t border-gray-700/50 my-2"></div>
                    <button onClick={() => {setShowMobileMenu(false); handleSignOut();}} className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200">{t("nav.logout")}</button>
                  </>
                ) : (
                  <>
                    <div className="border-t border-gray-700/50 my-2"></div>
                    <Link href="/login" className="flex items-center px-4 py-3 text-sm text-orange-400 hover:bg-gray-700/50 transition-colors duration-200" onClick={() => setShowMobileMenu(false)}>{t("nav.login")}</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 