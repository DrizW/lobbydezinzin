import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-orange-400">LobbyDeZinzin</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Service de géolocalisation DNS pour optimiser vos performances de jeu. 
              Réduisez votre latence et améliorez votre expérience de jeu.
            </p>
            <div className="flex space-x-4">
              <a 
                href="mailto:support@lobbydezinzin.com" 
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/subscription" 
                  className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                >
                  Abonnements
                </Link>
              </li>
              <li>
                <Link 
                  href="/sessions" 
                  className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                >
                  Sessions actives
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations légales */}
          <div>
            <h3 className="text-white font-semibold mb-4">Informations légales</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/legal/cgu" 
                  className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                >
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal/privacy" 
                  className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    // Déclencher l'affichage de la bannière cookies
                    const event = new CustomEvent('show-cookie-preferences');
                    window.dispatchEvent(event);
                  }}
                  className="text-gray-400 hover:text-orange-400 transition-colors text-sm text-left"
                >
                  Préférences cookies
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} LobbyDeZinzin. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                href="/legal/cgu" 
                className="text-gray-400 hover:text-orange-400 transition-colors text-xs"
              >
                CGU
              </Link>
              <Link 
                href="/legal/privacy" 
                className="text-gray-400 hover:text-orange-400 transition-colors text-xs"
              >
                Confidentialité
              </Link>
              <button 
                onClick={() => {
                  const event = new CustomEvent('show-cookie-preferences');
                  window.dispatchEvent(event);
                }}
                className="text-gray-400 hover:text-orange-400 transition-colors text-xs"
              >
                Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
