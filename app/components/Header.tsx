"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Logo from "./Logo";

export default function Header() {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
              Bénéfices
            </Link>
            <Link href="/countries" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium">
              Aide
            </Link>
            
            {status === "loading" ? (
              <div className="bg-gray-700 px-4 py-2 rounded-lg text-gray-300 animate-pulse">
                Chargement...
              </div>
            ) : session ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {session.user?.email || "Mon compte"}
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 py-2 z-50">
                    <Link 
                      href="/dashboard" 
                      className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link 
                      href="/countries" 
                      className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Aide & Support
                    </Link>
                    <Link 
                      href="/contact" 
                      className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.697-.413l-3.191 1.063a.75.75 0 01-.96-.96l1.063-3.191A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                      </svg>
                      Contact
                    </Link>
                    {session.user?.role === "ADMIN" && (
                      <Link 
                        href="/admin" 
                        className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200"
                        onClick={() => setShowMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin
                      </Link>
                    )}
                    <div className="border-t border-gray-700/50 my-2"></div>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                  Connexion
                </button>
              </Link>
            )}
          </nav>

          {/* Menu mobile */}
          <div className="md:hidden" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-300 hover:text-orange-400 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Menu mobile déroulant */}
            {showMenu && (
              <div className="absolute right-4 top-16 w-64 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 py-2 z-50">
                <Link 
                  href="/benefices" 
                  className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200"
                  onClick={() => setShowMenu(false)}
                >
                  Bénéfices
                </Link>
                <Link 
                  href="/countries" 
                  className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200"
                  onClick={() => setShowMenu(false)}
                >
                  Aide
                </Link>
                <Link 
                  href="/contact" 
                  className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200"
                  onClick={() => setShowMenu(false)}
                >
                  Contact
                </Link>
                
                {session ? (
                  <>
                    <div className="border-t border-gray-700/50 my-2"></div>
                    <Link 
                      href="/dashboard" 
                      className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    {session.user?.role === "ADMIN" && (
                      <Link 
                        href="/admin" 
                        className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200"
                        onClick={() => setShowMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin
                      </Link>
                    )}
                    <div className="border-t border-gray-700/50 my-2"></div>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <div className="border-t border-gray-700/50 my-2"></div>
                    <Link 
                      href="/login"
                      className="flex items-center px-4 py-3 text-sm text-orange-400 hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setShowMenu(false)}
                    >
                      Connexion
                    </Link>
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