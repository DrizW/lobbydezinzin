import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const countries = [
  {
    name: "Nigeria",
    flag: "🇳🇬",
    kdRange: "0.6-0.9",
    kdValue: 0.75,
    description: "Lobbies ultra-faciles - Le meilleur choix !",
    dnsPrimary: "8.8.8.8",
    dnsSecondary: "8.8.4.4",
    color: "from-blue-500 to-cyan-600"
  },
  {
    name: "Taiwan",
    flag: "🇹🇼",
    kdRange: "0.7-1.0",
    kdValue: 0.85,
    description: "Lobbies très faciles - Excellente option",
    dnsPrimary: "1.1.1.1",
    dnsSecondary: "1.0.0.1",
    color: "from-green-500 to-emerald-600"
  },
  {
    name: "Israël",
    flag: "🇮🇱",
    kdRange: "0.8-1.1",
    kdValue: 0.95,
    description: "Lobbies faciles - Très bon choix",
    dnsPrimary: "208.67.222.222",
    dnsSecondary: "208.67.220.220",
    color: "from-purple-500 to-pink-600"
  },
  {
    name: "Thaïlande",
    flag: "🇹🇭",
    kdRange: "0.8-1.2",
    kdValue: 1.0,
    description: "Lobbies faciles - Bon choix",
    dnsPrimary: "9.9.9.9",
    dnsSecondary: "149.112.112.112",
    color: "from-orange-500 to-red-600"
  },
  {
    name: "Cambodge",
    flag: "🇰🇭",
    kdRange: "0.9-1.2",
    kdValue: 1.05,
    description: "Lobbies modérés - Correct",
    dnsPrimary: "8.26.56.26",
    dnsSecondary: "8.20.247.20",
    color: "from-yellow-500 to-orange-600"
  },
  {
    name: "Maroc",
    flag: "🇲🇦",
    kdRange: "0.9-1.3",
    kdValue: 1.1,
    description: "Lobbies modérés - Pas mal",
    dnsPrimary: "185.228.168.9",
    dnsSecondary: "185.228.169.9",
    color: "from-red-500 to-pink-600"
  },
  {
    name: "Algérie",
    flag: "🇩🇿",
    kdRange: "1.0-1.3",
    kdValue: 1.15,
    description: "Lobbies modérés - Correct",
    dnsPrimary: "76.76.19.19",
    dnsSecondary: "76.76.2.0",
    color: "from-green-600 to-teal-700"
  },
  {
    name: "Tunisie",
    flag: "🇹🇳",
    kdRange: "1.0-1.4",
    kdValue: 1.2,
    description: "Lobbies modérés - Moyen",
    dnsPrimary: "94.140.14.14",
    dnsSecondary: "94.140.15.15",
    color: "from-blue-600 to-indigo-700"
  },
  {
    name: "Kenya",
    flag: "🇰🇪",
    kdRange: "1.1-1.4",
    kdValue: 1.25,
    description: "Lobbies modérés - Correct",
    dnsPrimary: "176.103.130.130",
    dnsSecondary: "176.103.130.131",
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