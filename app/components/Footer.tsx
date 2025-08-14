'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black border-t border-gray-700/50 mt-auto overflow-hidden">
      {/* Effet de fond décoratif */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>
      
      <div className="relative container mx-auto px-6 py-12">
        {/* Section principale */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-12">
          {/* Logo et description */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="relative">
                <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  LobbyDeZinzin
                </span>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
              </div>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
              Service de géolocalisation DNS pour optimiser vos performances de jeu. 
              Réduisez votre latence et améliorez votre expérience de jeu.
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="mailto:support@lobbydezinzin.com" 
                className="group p-3 bg-gray-800/50 hover:bg-orange-600/20 border border-gray-700/50 hover:border-orange-500/50 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </a>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Service actif</span>
              </div>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full mr-3"></span>
                Liens rapides
              </h3>
              <ul className="space-y-3">
                {[
                  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
                  { href: '/subscription', label: 'Abonnements', icon: '💎' },
                  { href: '/sessions', label: 'Sessions actives', icon: '🔐' },
                  { href: '/contact', label: 'Contact', icon: '📞' }
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="group flex items-center text-gray-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1"
                    >
                      <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Informations légales */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full mr-3"></span>
                Informations légales
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/legal/cgu" 
                    className="group flex items-center text-gray-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">📋</span>
                    <span className="text-sm font-medium">Conditions d'utilisation</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/legal/privacy" 
                    className="group flex items-center text-gray-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">🛡️</span>
                    <span className="text-sm font-medium">Politique de confidentialité</span>
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      const event = new CustomEvent('show-cookie-preferences');
                      window.dispatchEvent(event);
                    }}
                    className="group flex items-center text-gray-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1 text-left w-full"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">🍪</span>
                    <span className="text-sm font-medium">Préférences cookies</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ligne de séparation avec effet */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700/50"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6 text-gray-500 text-sm">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-white text-xs">⚡</span>
              </div>
            </span>
          </div>
        </div>

        {/* Section copyright et liens courts */}
        <div className="mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-gray-400 text-sm">
                © {currentYear} <span className="text-orange-400 font-semibold">LobbyDeZinzin</span>. Tous droits réservés.
              </p>
              <div className="hidden md:flex items-center space-x-2 text-gray-500 text-xs">
                <span>•</span>
                <span>Optimisation DNS</span>
                <span>•</span>
                <span>Performance Gaming</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {[
                { href: '/legal/cgu', label: 'CGU' },
                { href: '/legal/privacy', label: 'Confidentialité' },
                { label: 'Cookies', action: 'cookies' }
              ].map((item) => (
                <div key={item.label}>
                  {item.href ? (
                    <Link 
                      href={item.href} 
                      className="text-gray-400 hover:text-orange-400 transition-colors text-xs font-medium hover:scale-105 inline-block"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button 
                      onClick={() => {
                        const event = new CustomEvent('show-cookie-preferences');
                        window.dispatchEvent(event);
                      }}
                      className="text-gray-400 hover:text-orange-400 transition-colors text-xs font-medium hover:scale-105"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badge de performance */}
        <div className="mt-8 pt-6 border-t border-gray-700/30">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 text-gray-500 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>SSL Sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Support 24/7</span>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2">
                <span className="text-orange-400 text-sm">⚡</span>
                <span className="text-gray-300 text-xs font-medium">Optimisé pour Warzone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
