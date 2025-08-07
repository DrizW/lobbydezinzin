"use client";
import { useState } from "react";
import ClientOnly from "../components/ClientOnly";

const faqs = [
  {
    id: 1,
    category: "Configuration",
    question: "Comment configurer le DNS sur ma PlayStation 5 ?",
    answer: `1. Allez dans **Paramètres** > **Système** > **Console**
2. Sélectionnez **Paramètres réseau**
3. Choisissez **Configurer la connexion Internet**
4. Sélectionnez votre connexion (Wi-Fi ou Ethernet)
5. Choisissez **Avancé** > **Paramètres DNS**
6. Sélectionnez **Manuel**
7. DNS Primaire : **192.168.1.31**
8. DNS Secondaire : **8.8.8.8**
9. Testez la connexion`
  },
  {
    id: 2,
    category: "Configuration",
    question: "Comment configurer le DNS sur Xbox Series X/S ?",
    answer: `1. Appuyez sur le bouton **Xbox** de votre manette
2. Allez dans **Paramètres** > **Général** > **Paramètres réseau**
3. Sélectionnez **Paramètres avancés**
4. Choisissez **Paramètres DNS**
5. Sélectionnez **Manuel**
6. DNS Primaire : **192.168.1.31**
7. DNS Secondaire : **8.8.8.8**
8. Appuyez sur **B** pour sauvegarder`
  },
  {
    id: 3,
    category: "Configuration",
    question: "Comment configurer le DNS sur PC Windows ?",
    answer: `**Configuration rapide :**

1. Paramètres > Réseau et Internet > Modifier les options d'adaptateur
2. Clic droit sur votre connexion > Propriétés
3. Sélectionnez **TCP/IPv4** > Propriétés
4. DNS préféré : **192.168.1.31**
5. DNS auxiliaire : **8.8.8.8**`
  },
  {
    id: 4,
    category: "Fonctionnement",
    question: "Comment fonctionne le Smart DNS LobbyDeZinzin ?",
    answer: `Notre Smart DNS fonctionne en **3 étapes simples** :

1. **Identification** : Votre IP publique est automatiquement détectée
2. **Redirection** : Selon votre région choisie sur le site, nous redirigeons les requêtes DNS de Call of Duty vers les serveurs de la région sélectionnée
3. **Connexion** : Warzone pense que vous êtes dans cette région et vous connecte aux lobbies locaux

**Résultat** : Des lobbies plus faciles avec des joueurs moins expérimentés !`
  },
  {
    id: 5,
    category: "Fonctionnement",
    question: "Quelle est la différence avec un VPN classique ?",
    answer: `**Smart DNS** : Ping optimal, seul Call of Duty redirigé, configuration simple
**VPN classique** : Ralentit la connexion, tout le trafic redirigé, souvent détecté`
  },
  {
    id: 6,
    category: "Utilisation",
    question: "Comment changer de région ?",
    answer: `**C'est très simple** :

1. Connectez-vous sur **lobbydezinzin.com**
2. Allez dans votre **Dashboard**
3. Utilisez le sélecteur de région
4. Choisissez votre région (Nigeria pour lobbies très faciles)
5. **L'effet est instantané** - pas besoin de redémarrer votre console !

**Astuce** : Commencez par le Nigeria pour les lobbies les plus faciles.`
  },
  {
    id: 7,
    category: "Utilisation",
    question: "Quelles régions donnent les lobbies les plus faciles ?",
    answer: `**Classement par facilité** (KD moyen des lobbies) :

🥇 **Nigeria** - KD 0.8-1.0 (Très facile)
🥈 **Thaïlande** - KD 0.9-1.1 (Facile)  
🥉 **Israël** - KD 1.0-1.2 (Modéré)
🏅 **Taiwan** - KD 1.1-1.3 (Légèrement facile)

**Recommandation** : Commencez par le Nigeria, puis ajustez selon vos préférences.`
  },
  {
    id: 8,
    category: "Problèmes",
    question: "Warzone ne trouve pas de partie, que faire ?",
    answer: `**Solutions par ordre de priorité** :

1. **Vérifiez votre région** sur le dashboard
2. **Redémarrez Warzone** complètement
3. **Changez de région** temporairement puis revenez
4. **Vérifiez votre DNS** dans les paramètres console
5. **Testez avec une autre région** (Taiwan ou Israël)

**Si ça persiste** : Contactez notre support avec votre IP publique.`
  },
  {
    id: 9,
    category: "Problèmes",
    question: "Mon ping est-il affecté ?",
    answer: `**Non !** Le Smart DNS ne redirige que la résolution DNS. Votre ping reste identique à une connexion normale.`
  },
  {
    id: 10,
    category: "Compte",
    question: "Comment fonctionne l'abonnement Premium ?",
    answer: `**Abonnement Premium** :

✅ **Accès à toutes les régions**
✅ **Changement illimité** de région
✅ **Support prioritaire**
✅ **Statistiques avancées**
✅ **Nouvelles régions en avant-première**

**Version gratuite** : Région limitée avec quelques changements par jour.
**Premium** : Accès complet sans restriction.`
  }
];

const categories = ["Tous", "Configuration", "Fonctionnement", "Utilisation", "Problèmes", "Compte"];

export default function CountriesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = selectedCategory === "Tous" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-gray-700/50">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  FAQ
                </span>
                <span className="text-white"> - Questions Fréquentes</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Tout ce que vous devez savoir sur LobbyDeZinzin pour optimiser votre expérience Warzone
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 overflow-hidden hover:border-orange-500/30 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-700/20 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 text-sm font-medium rounded-full border border-orange-500/30">
                      {faq.category}
                    </span>
                    <h3 className="text-lg font-semibold text-white">
                      {faq.question}
                    </h3>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${
                      openFaq === faq.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openFaq === faq.id && (
                  <div className="px-8 pb-6">
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line border-t border-gray-700/30 pt-6">
                      {faq.answer.split('**').map((part, index) => (
                        index % 2 === 0 ? (
                          <span key={index}>{part}</span>
                        ) : (
                          <strong key={index} className="text-white font-semibold">{part}</strong>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Vous ne trouvez pas votre réponse ?
              </h3>
              <p className="text-gray-300 mb-6">
                Notre équipe support est là pour vous aider à optimiser votre expérience Warzone
              </p>
              <a href="/contact" className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Contacter le Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
} 