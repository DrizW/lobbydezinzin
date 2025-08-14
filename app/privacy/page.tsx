import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Politique de Confidentialité</h1>
            <p className="text-gray-400 text-lg">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
            <p className="text-gray-300 mb-4">
              Chez LobbyDeZinzin, nous nous engageons à protéger votre vie privée et vos données personnelles. 
              Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
            </p>
            <p className="text-gray-300">
              En utilisant notre service, vous acceptez les pratiques décrites dans cette politique.
            </p>
          </div>

          {/* Collecte des données */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📊 Collecte des données</h2>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Données que nous collectons</h3>
            <ul className="text-gray-300 space-y-2 mb-6">
              <li><strong>Informations de compte :</strong> Email, mot de passe (hashé), nom d'utilisateur</li>
              <li><strong>Données de connexion :</strong> Adresse IP, User-Agent, horodatage des connexions</li>
              <li><strong>Préférences :</strong> Région sélectionnée, paramètres DNS, préférences de cookies</li>
              <li><strong>Données d'utilisation :</strong> Pages visitées, actions effectuées, logs DNS</li>
              <li><strong>Données de paiement :</strong> Informations Stripe (gérées par Stripe, pas par nous)</li>
            </ul>

            <h3 className="text-xl font-semibold text-orange-400 mb-3">Comment nous collectons ces données</h3>
            <ul className="text-gray-300 space-y-2">
              <li>Lors de votre inscription et connexion</li>
              <li>Via les cookies et technologies similaires</li>
              <li>Lors de l'utilisation de nos services DNS</li>
              <li>Par le biais de nos outils d'analyse</li>
            </ul>
          </div>

          {/* Utilisation des données */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🎯 Utilisation des données</h2>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Finalités principales</h3>
            <ul className="text-gray-300 space-y-2 mb-6">
              <li><strong>Fourniture du service :</strong> Gestion de votre compte, configuration DNS, support client</li>
              <li><strong>Sécurité :</strong> Protection contre la fraude, détection d'activités suspectes</li>
              <li><strong>Amélioration :</strong> Analyse des performances, développement de nouvelles fonctionnalités</li>
              <li><strong>Communication :</strong> Notifications importantes, support technique</li>
              <li><strong>Conformité :</strong> Respect des obligations légales et réglementaires</li>
            </ul>

            <h3 className="text-xl font-semibold text-orange-400 mb-3">Base légale</h3>
            <ul className="text-gray-300 space-y-2">
              <li><strong>Exécution du contrat :</strong> Pour fournir nos services</li>
              <li><strong>Intérêt légitime :</strong> Pour la sécurité et l'amélioration du service</li>
              <li><strong>Consentement :</strong> Pour les cookies non essentiels et le marketing</li>
              <li><strong>Obligation légale :</strong> Pour la conformité réglementaire</li>
            </ul>
          </div>

          {/* Cookies */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🍪 Cookies et technologies similaires</h2>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Types de cookies utilisés</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-400">Cookies essentiels</h4>
                <p className="text-gray-300 text-sm">Nécessaires au fonctionnement du site (session, authentification, sécurité)</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-400">Cookies d'analyse</h4>
                <p className="text-gray-300 text-sm">Mesure du trafic et analyse des performances (avec votre consentement)</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-purple-400">Cookies de performance</h4>
                <p className="text-gray-300 text-sm">Optimisation des performances et mémorisation des préférences</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-yellow-400">Cookies marketing</h4>
                <p className="text-gray-300 text-sm">Publicité ciblée et contenus personnalisés (avec votre consentement)</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-300 text-sm">
                <strong>Gestion des cookies :</strong> Vous pouvez modifier vos préférences de cookies à tout moment 
                via notre bannière de cookies ou en nous contactant.
              </p>
            </div>
          </div>

          {/* Partage des données */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🤝 Partage des données</h2>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Nous ne vendons jamais vos données</h3>
            <p className="text-gray-300 mb-4">
              Vos données personnelles ne sont jamais vendues à des tiers. Nous ne les partageons que dans les cas suivants :
            </p>

            <ul className="text-gray-300 space-y-2 mb-6">
              <li><strong>Prestataires de services :</strong> Stripe (paiements), services d'hébergement, outils d'analyse</li>
              <li><strong>Obligations légales :</strong> Réponse aux demandes des autorités compétentes</li>
              <li><strong>Protection de nos droits :</strong> En cas de violation de nos conditions d'utilisation</li>
              <li><strong>Avec votre consentement :</strong> Dans des cas spécifiques et limités</li>
            </ul>

            <h3 className="text-xl font-semibold text-orange-400 mb-3">Sécurité des données</h3>
            <ul className="text-gray-300 space-y-2">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Mots de passe hashés avec bcrypt</li>
              <li>Accès restreint aux données sensibles</li>
              <li>Surveillance continue de la sécurité</li>
            </ul>
          </div>

          {/* Vos droits */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">⚖️ Vos droits RGPD</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-3">Droit d'accès</h3>
                <p className="text-gray-300 text-sm">
                  Vous pouvez demander une copie de toutes les données que nous détenons sur vous.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-3">Droit de rectification</h3>
                <p className="text-gray-300 text-sm">
                  Vous pouvez corriger ou mettre à jour vos informations personnelles.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-3">Droit à l'effacement</h3>
                <p className="text-gray-300 text-sm">
                  Vous pouvez demander la suppression de vos données (droit à l'oubli).
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-3">Droit à la portabilité</h3>
                <p className="text-gray-300 text-sm">
                  Vous pouvez récupérer vos données dans un format structuré.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-3">Droit d'opposition</h3>
                <p className="text-gray-300 text-sm">
                  Vous pouvez vous opposer au traitement de vos données.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-3">Droit de retrait</h3>
                <p className="text-gray-300 text-sm">
                  Vous pouvez retirer votre consentement à tout moment.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-orange-900/20 border border-orange-700 rounded-lg">
              <p className="text-orange-300 text-sm">
                <strong>Pour exercer vos droits :</strong> Contactez-nous à{' '}
                <a href="mailto:privacy@lobbydezinzin.com" className="underline hover:text-orange-200">
                  privacy@lobbydezinzin.com
                </a>
              </p>
            </div>
          </div>

          {/* Conservation des données */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">⏰ Conservation des données</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Données de compte</h3>
                <p className="text-gray-300 text-sm">
                  Conservées tant que votre compte est actif, puis supprimées dans les 30 jours suivant la fermeture.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Logs de connexion</h3>
                <p className="text-gray-300 text-sm">
                  Conservés pendant 12 mois pour des raisons de sécurité.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Données d'analyse</h3>
                <p className="text-gray-300 text-sm">
                  Conservées pendant 24 mois, puis anonymisées.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Données de paiement</h3>
                <p className="text-gray-300 text-sm">
                  Conservées pendant 7 ans pour des raisons fiscales et comptables.
                </p>
              </div>
            </div>
          </div>

          {/* Transferts internationaux */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🌍 Transferts internationaux</h2>
            
            <p className="text-gray-300 mb-4">
              Nos serveurs sont principalement situés dans l'Union Européenne. Cependant, certains de nos prestataires 
              peuvent être situés dans d'autres pays.
            </p>
            
            <p className="text-gray-300 mb-4">
              Nous nous assurons que tous les transferts de données respectent les standards de protection appropriés, 
              notamment via des clauses contractuelles types approuvées par la Commission européenne.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📞 Contact</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Délégué à la protection des données</h3>
                <p className="text-gray-300">
                  Email : <a href="mailto:dpo@lobbydezinzin.com" className="text-orange-400 hover:underline">dpo@lobbydezinzin.com</a>
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Support général</h3>
                <p className="text-gray-300">
                  Email : <a href="mailto:privacy@lobbydezinzin.com" className="text-orange-400 hover:underline">privacy@lobbydezinzin.com</a>
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Autorité de contrôle</h3>
                <p className="text-gray-300 text-sm">
                  Vous avez le droit de déposer une plainte auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) 
                  si vous estimez que vos droits ne sont pas respectés.
                </p>
              </div>
            </div>
          </div>

          {/* Liens utiles */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">🔗 Liens utiles</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/legal/cgu" 
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-white mb-2">Conditions Générales d'Utilisation</h3>
                <p className="text-gray-300 text-sm">Règles d'utilisation de nos services</p>
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
