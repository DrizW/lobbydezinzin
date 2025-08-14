import Link from 'next/link';

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Conditions Générales d'Utilisation</h1>
            <p className="text-gray-400 text-lg">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
            <p className="text-gray-300 mb-4">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du service LobbyDeZinzin, 
              un service de géolocalisation DNS pour l'optimisation des performances de jeu.
            </p>
            <p className="text-gray-300">
              En utilisant notre service, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces conditions, 
              veuillez ne pas utiliser notre service.
            </p>
          </div>

          {/* Définitions */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📋 Définitions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Service</h3>
                <p className="text-gray-300">LobbyDeZinzin, plateforme de géolocalisation DNS et optimisation de connexion pour jeux vidéo.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Utilisateur</h3>
                <p className="text-gray-300">Toute personne utilisant le Service, qu'elle soit inscrite ou non.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Compte</h3>
                <p className="text-gray-300">L'espace personnel créé par l'utilisateur pour accéder aux fonctionnalités du Service.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Abonnement</h3>
                <p className="text-gray-300">L'engagement payant permettant l'accès aux fonctionnalités Premium du Service.</p>
              </div>
            </div>
          </div>

          {/* Description du service */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🎯 Description du Service</h2>
            <p className="text-gray-300 mb-4">
              LobbyDeZinzin propose un service de géolocalisation DNS permettant d'optimiser les performances de connexion 
              pour les jeux vidéo en ligne, notamment Call of Duty: Warzone.
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-orange-400 mt-1">•</span>
                <p className="text-gray-300">Optimisation automatique des serveurs DNS pour réduire la latence</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-orange-400 mt-1">•</span>
                <p className="text-gray-300">Sélection de régions géographiques pour améliorer les performances</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-orange-400 mt-1">•</span>
                <p className="text-gray-300">Monitoring en temps réel de la qualité de connexion</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-orange-400 mt-1">•</span>
                <p className="text-gray-300">Support technique et assistance utilisateur</p>
              </div>
            </div>
          </div>

          {/* Inscription et compte */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">👤 Inscription et Compte</h2>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Création de compte</h3>
            <ul className="text-gray-300 space-y-2 mb-6">
              <li>• L'inscription est gratuite et nécessite une adresse email valide</li>
              <li>• Vous devez fournir des informations exactes et à jour</li>
              <li>• Vous êtes responsable de la confidentialité de vos identifiants</li>
              <li>• Un seul compte par personne est autorisé</li>
            </ul>

            <h3 className="text-xl font-semibold text-orange-400 mb-3">Obligations de l'utilisateur</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Utiliser le Service conformément à ces CGU</li>
              <li>• Ne pas partager vos identifiants de connexion</li>
              <li>• Signaler immédiatement toute utilisation non autorisée</li>
              <li>• Respecter les droits de propriété intellectuelle</li>
            </ul>
          </div>

          {/* Abonnements et paiements */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">💳 Abonnements et Paiements</h2>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Services Premium</h3>
            <p className="text-gray-300 mb-4">
              Certaines fonctionnalités avancées nécessitent un abonnement payant. Les prix sont affichés en euros (€) 
              et incluent toutes les taxes applicables.
            </p>

            <h3 className="text-xl font-semibold text-orange-400 mb-3">Modalités de paiement</h3>
            <ul className="text-gray-300 space-y-2 mb-6">
              <li>• Les paiements sont traités par Stripe, partenaire de confiance</li>
              <li>• L'abonnement est renouvelé automatiquement sauf résiliation</li>
              <li>• Les factures sont disponibles dans votre espace client</li>
              <li>• Aucun remboursement en cas d'utilisation du service</li>
            </ul>

            <h3 className="text-xl font-semibold text-orange-400 mb-3">Résiliation</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Vous pouvez résilier votre abonnement à tout moment</li>
              <li>• La résiliation prend effet à la fin de la période en cours</li>
              <li>• Aucun remboursement pour la période non utilisée</li>
            </ul>
          </div>

          {/* Utilisation acceptable */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">✅ Utilisation Acceptable</h2>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Utilisations autorisées</h3>
            <ul className="text-gray-300 space-y-2 mb-6">
              <li>• Optimisation de vos propres connexions de jeu</li>
              <li>• Utilisation personnelle et non commerciale</li>
              <li>• Respect des conditions d'utilisation des jeux</li>
              <li>• Conformité avec les lois en vigueur</li>
            </ul>

            <h3 className="text-xl font-semibold text-orange-400 mb-3">Utilisations interdites</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Utilisation commerciale sans autorisation</li>
              <li>• Tentative de contournement des mesures de sécurité</li>
              <li>• Utilisation pour des activités illégales</li>
              <li>• Perturbation du service pour d'autres utilisateurs</li>
              <li>• Violation des droits de propriété intellectuelle</li>
            </ul>
          </div>

          {/* Propriété intellectuelle */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🔒 Propriété Intellectuelle</h2>
            
            <p className="text-gray-300 mb-4">
              LobbyDeZinzin et tous ses éléments (code, design, marques, etc.) sont protégés par les droits de propriété intellectuelle.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Droits réservés</h3>
                <p className="text-gray-300 text-sm">
                  Tous les droits sont réservés. Aucune reproduction, distribution ou modification n'est autorisée 
                  sans autorisation écrite préalable.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Licence d'utilisation</h3>
                <p className="text-gray-300 text-sm">
                  Nous vous accordons une licence limitée, non exclusive et révocable pour utiliser le Service 
                  conformément à ces CGU.
                </p>
              </div>
            </div>
          </div>

          {/* Limitation de responsabilité */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">⚠️ Limitation de Responsabilité</h2>
            
            <p className="text-gray-300 mb-4">
              Dans toute la mesure permise par la loi applicable, LobbyDeZinzin ne peut être tenu responsable de :
            </p>

            <ul className="text-gray-300 space-y-2 mb-6">
              <li>• Perte de données ou interruption de service</li>
              <li>• Dommages indirects ou consécutifs</li>
              <li>• Pertes de profits ou d'opportunités commerciales</li>
              <li>• Actions de tiers (éditeurs de jeux, fournisseurs d'accès)</li>
            </ul>

            <div className="p-4 bg-orange-900/20 border border-orange-700 rounded-lg">
              <p className="text-orange-300 text-sm">
                <strong>Note importante :</strong> LobbyDeZinzin est un outil d'optimisation. Nous ne garantissons pas 
                l'amélioration des performances dans tous les cas, car celles-ci dépendent de nombreux facteurs externes.
              </p>
            </div>
          </div>

          {/* Protection des données */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🛡️ Protection des Données</h2>
            
            <p className="text-gray-300 mb-4">
              La protection de vos données personnelles est une priorité. Pour plus d'informations, 
              consultez notre politique de confidentialité.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Collecte de données</h3>
                <p className="text-gray-300 text-sm">
                  Nous collectons uniquement les données nécessaires au fonctionnement du service 
                  (email, logs de connexion, préférences).
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Sécurité</h3>
                <p className="text-gray-300 text-sm">
                  Vos données sont protégées par des mesures de sécurité appropriées 
                  (chiffrement, accès restreint, sauvegardes).
                </p>
              </div>
            </div>
          </div>

          {/* Modifications des CGU */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📝 Modifications des CGU</h2>
            
            <p className="text-gray-300 mb-4">
              Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications entrent en vigueur 
              dès leur publication sur le site.
            </p>

            <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Notification :</strong> En cas de modification substantielle, nous vous informerons 
                par email ou via une notification sur le site.
              </p>
            </div>
          </div>

          {/* Droit applicable */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">⚖️ Droit Applicable</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Loi applicable</h3>
                <p className="text-gray-300 text-sm">
                  Ces CGU sont régies par le droit français. Tout litige sera soumis à la compétence 
                  des tribunaux français.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Clause de séparabilité</h3>
                <p className="text-gray-300 text-sm">
                  Si une clause de ces CGU est jugée invalide, les autres clauses restent en vigueur.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📞 Contact</h2>
            
            <p className="text-gray-300 mb-4">
              Pour toute question concernant ces CGU, vous pouvez nous contacter :
            </p>

            <div className="space-y-2">
              <p className="text-gray-300">
                <strong>Email :</strong> <a href="mailto:legal@lobbydezinzin.com" className="text-orange-400 hover:underline">legal@lobbydezinzin.com</a>
              </p>
              <p className="text-gray-300">
                <strong>Support :</strong> <a href="mailto:support@lobbydezinzin.com" className="text-orange-400 hover:underline">support@lobbydezinzin.com</a>
              </p>
            </div>
          </div>

          {/* Liens utiles */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">🔗 Liens Utiles</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/privacy" 
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-white mb-2">Politique de Confidentialité</h3>
                <p className="text-gray-300 text-sm">Protection de vos données personnelles</p>
              </Link>
              <Link 
                href="/contact" 
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-white mb-2">Contact</h3>
                <p className="text-gray-300 text-sm">Nous contacter pour toute question</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


