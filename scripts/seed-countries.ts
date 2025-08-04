import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Configuration DNS publics par pays (100% GRATUIT!)
// Utilise les DNS des opérateurs télécoms locaux pour contourner SBMM
const countries = [
  {
    name: "Nigeria",
    flag: "🇳🇬",
    kdRange: "0.6-0.9",
    kdValue: 0.75,
    description: "Lobbies ultra-faciles - Le meilleur choix !",
    dnsPrimary: "196.216.2.1",     // MainOne Cable Nigeria (gratuit)
    dnsSecondary: "41.58.184.1",   // WACREN Nigeria (gratuit)
    color: "from-blue-500 to-cyan-600"
  },
  {
    name: "Taiwan",
    flag: "🇹🇼",
    kdRange: "0.7-1.0",
    kdValue: 0.85,
    description: "Lobbies très faciles - Excellente option",
    dnsPrimary: "168.95.1.1",      // HiNet Taiwan (gratuit)
    dnsSecondary: "168.95.192.1",  // HiNet Secondary (gratuit)
    color: "from-green-500 to-emerald-600"
  },
  {
    name: "Israël",
    flag: "🇮🇱",
    kdRange: "0.8-1.1",
    kdValue: 0.95,
    description: "Lobbies faciles - Très bon choix",
    dnsPrimary: "80.179.54.171",   // Bezeq Israel (gratuit)
    dnsSecondary: "199.0.2.1",     // Israeli Internet Association (gratuit)
    color: "from-purple-500 to-pink-600"
  },
  {
    name: "Thaïlande",
    flag: "🇹🇭",
    kdRange: "0.8-1.2",
    kdValue: 1.0,
    description: "Lobbies faciles - Bon choix",
    dnsPrimary: "203.113.131.1",   // CAT Telecom Thailand (gratuit)
    dnsSecondary: "203.144.206.205", // TOT Thailand (gratuit)
    color: "from-orange-500 to-red-600"
  },
  {
    name: "Cambodge",
    flag: "🇰🇭",
    kdRange: "0.9-1.2",
    kdValue: 1.05,
    description: "Lobbies modérés - Correct",
    dnsPrimary: "203.144.206.205", // Ezecom Cambodia (gratuit)
    dnsSecondary: "8.8.8.8",       // Google fallback
    color: "from-yellow-500 to-orange-600"
  },
  {
    name: "Maroc",
    flag: "🇲🇦",
    kdRange: "0.9-1.3",
    kdValue: 1.1,
    description: "Lobbies modérés - Pas mal",
    dnsPrimary: "41.251.20.20",    // Maroc Telecom (gratuit)
    dnsSecondary: "185.228.168.9", // CleanBrowsing fallback
    color: "from-red-500 to-pink-600"
  },
  {
    name: "Algérie",
    flag: "🇩🇿",
    kdRange: "1.0-1.3",
    kdValue: 1.15,
    description: "Lobbies modérés - Correct",
    dnsPrimary: "41.111.201.20",   // Algerie Telecom (gratuit)
    dnsSecondary: "76.76.19.19",   // Alternate DNS fallback
    color: "from-green-600 to-teal-700"
  },
  {
    name: "Tunisie",
    flag: "🇹🇳",
    kdRange: "1.0-1.4",
    kdValue: 1.2,
    description: "Lobbies modérés - Moyen",
    dnsPrimary: "41.229.0.6",      // Tunisie Telecom (gratuit)
    dnsSecondary: "94.140.14.14",  // AdGuard fallback
    color: "from-blue-600 to-indigo-700"
  },
  {
    name: "Kenya",
    flag: "🇰🇪",
    kdRange: "1.1-1.4",
    kdValue: 1.25,
    description: "Lobbies modérés - Correct",
    dnsPrimary: "41.220.244.244", // Safaricom Kenya (gratuit)
    dnsSecondary: "176.103.130.130", // AdGuard fallback
    color: "from-black to-gray-800"
  }
];

async function main() {
  console.log("🌍 Initialisation des pays...");

  for (const country of countries) {
    try {
      await prisma.country.upsert({
        where: { name: country.name },
        update: country,
        create: country
      });
      console.log(`✅ ${country.flag} ${country.name} ajouté/mis à jour`);
    } catch (error) {
      console.error(`❌ Erreur pour ${country.name}:`, error);
    }
  }

  console.log("🎉 Initialisation terminée !");
}

main()
  .catch((e) => {
    console.error("Erreur lors de l'initialisation:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 