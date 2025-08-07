#!/usr/bin/env node

/**
 * 🎯 LobbyDeZinzin - Geolocation DNS Server
 * 
 * Méthode NolagVPN/LobbyGod : DNS Geolocation Spoofing
 * - Seuls les domaines de géolocalisation sont redirigés vers mini-VPS
 * - Le trafic de jeu reste direct → ping optimal (8-40ms)
 * - Warzone vous voit dans le pays sélectionné mais vous jouez sur serveurs locaux !
 */

const dgram = require('dgram');
const dns = require('dns');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const server = dgram.createSocket('udp4');

// 🌍 Configuration des domaines de géolocalisation Call of Duty
const GEOLOCATION_DOMAINS = [
  'telescope.battle.net',
  'telescope.callofduty.com',      // ✅ Domaine réel utilisé par PS5
  'telescope-api.callofduty.com',  // ✅ Domaine API réel
  'cod-assets.cdn.callofduty.com', // ✅ Nouveau domaine détecté !
  'geoip.battle.net', 
  'geo.activision.com',
  'location-api.battle.net',
  'geolocation.call-of-duty.com',
  'region.battle.net',
  'location.blizzard.com'
  // ❌ DOMAINES SUPPRIMÉS : Causent "échec de connexion"
  // 'ingest.datax.activision.com',   // ❌ Télémétrie (essentiel)
  // 'prod.cdni.callofduty.com',      // ❌ CDN (essentiel)
  // 'genesis.stun.us.demonware.net', // ❌ STUN (essentiel)
  // 'genesis.stun.eu.demonware.net', // ❌ STUN (essentiel)
  // 'cer-ps5-loginservice.prod.demonware.net', // ❌ Login (essentiel)
  // 'lsg.7300.prod.demonware.net',   // ❌ Lobby (essentiel)
  // 'api.callofduty.com',            // ❌ API (essentiel)
  // 'geo.callofduty.com',            // ❌ API (essentiel)
  // 'location.callofduty.com',       // ❌ API (essentiel)
  // 'region.callofduty.com',         // ❌ API (essentiel)
  // 'geo.battle.net',                // ❌ API (essentiel)
  // 'location.battle.net',           // ❌ API (essentiel)
  // 'region.battle.net',             // ❌ API (essentiel)
  // 'geo.blizzard.com',              // ❌ API (essentiel)
  // 'location.blizzard.com',         // ❌ API (essentiel)
  // 'region.blizzard.com'            // ❌ API (essentiel)
];

// 🎯 Mini VPS pour géolocalisation (512MB RAM suffisent)
const REGION_GEOLOCATORS = {
  nigeria: {
    ip: '41.223.84.20', // VPS Nigeria (3€/mois)
    country: 'NG',
    flag: '🇳🇬',
    city: 'Lagos'
  },
  taiwan: {
    ip: '203.74.205.156', // VPS Taiwan (4€/mois) 
    country: 'TW',
    flag: '🇹🇼',
    city: 'Taipei'
  },
  morocco: {
    ip: '196.200.96.15', // VPS Maroc (3€/mois)
    country: 'MA', 
    flag: '🇲🇦',
    city: 'Casablanca'
  },
  thailand: {
    ip: '103.69.194.12', // VPS Thaïlande (4€/mois)
    country: 'TH',
    flag: '🇹🇭', 
    city: 'Bangkok'
  },
  kenya: {
    ip: '197.248.21.8', // VPS Kenya (4€/mois)
    country: 'KE',
    flag: '🇰🇪',
    city: 'Nairobi'
  }
};

// 🔄 DNS Fallback (Cloudflare)
const FALLBACK_DNS = ['1.1.1.1', '1.0.0.1'];

/**
 * 📦 Parse DNS Query
 */
function parseDNSQuery(buffer) {
  try {
    const id = buffer.readUInt16BE(0);
    const flags = buffer.readUInt16BE(2);
    const questions = buffer.readUInt16BE(4);
    
    if (questions !== 1) return null;
    
    let offset = 12;
    const labels = [];
    
    while (buffer[offset] !== 0) {
      const length = buffer[offset];
      offset++;
      labels.push(buffer.toString('utf8', offset, offset + length));
      offset += length;
    }
    
    const name = labels.join('.');
    offset++; // Skip null terminator
    
    const type = buffer.readUInt16BE(offset);
    const class_ = buffer.readUInt16BE(offset + 2);
    
    return { id, flags, name, type, class_ };
  } catch (error) {
    console.error('❌ DNS Parse Error:', error.message);
    return null;
  }
}

/**
 * 🏗️ Create DNS Response
 */
function createDNSResponse(query, ip) {
  const response = Buffer.alloc(512);
  let offset = 0;
  
  // Header
  response.writeUInt16BE(query.id, offset); offset += 2;
  response.writeUInt16BE(0x8180, offset); offset += 2; // Standard response
  response.writeUInt16BE(1, offset); offset += 2; // Questions
  response.writeUInt16BE(1, offset); offset += 2; // Answers
  response.writeUInt16BE(0, offset); offset += 2; // Authority
  response.writeUInt16BE(0, offset); offset += 2; // Additional
  
  // Question section (copy from query)
  const labels = query.name.split('.');
  for (const label of labels) {
    response.writeUInt8(label.length, offset++);
    response.write(label, offset);
    offset += label.length;
  }
  response.writeUInt8(0, offset++); // Null terminator
  response.writeUInt16BE(query.type, offset); offset += 2;
  response.writeUInt16BE(query.class_, offset); offset += 2;
  
  // Answer section
  response.writeUInt16BE(0xC00C, offset); offset += 2; // Name pointer
  response.writeUInt16BE(1, offset); offset += 2; // Type A
  response.writeUInt16BE(1, offset); offset += 2; // Class IN
  response.writeUInt32BE(300, offset); offset += 4; // TTL (5 minutes)
  response.writeUInt16BE(4, offset); offset += 2; // Data length
  
  // IP Address
  const ipParts = ip.split('.').map(Number);
  for (const part of ipParts) {
    response.writeUInt8(part, offset++);
  }
  
  return response.slice(0, offset);
}

/**
 * 👤 Get User by IP/Session mapping
 */
async function getUserByIP(clientIP) {
  try {
    // Pour l'instant, récupérer tous les utilisateurs Premium
    // TODO: Implémenter mapping IP → User via sessions/cookies
    const users = await prisma.user.findMany({
      where: {
        subscriptions: {
          some: {
            status: 'active'
          }
        }
      },
      include: {
        subscriptions: true,
        settings: true
      }
    });
    
    // Retourner le premier utilisateur Premium trouvé
    // En production, vous devriez mapper IP → utilisateur spécifique
    return users.length > 0 ? users[0] : null;
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return null;
  }
}

/**
 * 🌐 Forward to Cloudflare DNS
 */
function forwardToCloudflare(query, clientAddress, clientPort) {
  const client = dgram.createSocket('udp4');
  
  // Choisir un serveur DNS aléatoire
  const dnsServer = FALLBACK_DNS[Math.floor(Math.random() * FALLBACK_DNS.length)];
  
  client.send(query, 53, dnsServer, (error) => {
    if (error) {
      console.error('❌ Forward Error:', error.message);
      client.close();
      return;
    }
  });
  
  client.on('message', (response) => {
    server.send(response, clientPort, clientAddress);
    client.close();
  });
  
  client.on('error', (error) => {
    console.error('❌ Client Error:', error.message);
    client.close();
  });
  
  // Timeout après 5 secondes
  setTimeout(() => {
    client.close();
  }, 5000);
}

/**
 * 🎯 Main DNS Handler
 */
async function handleDNSQuery(msg, rinfo) {
  const query = parseDNSQuery(msg);
  
  if (!query) {
    console.log('❌ Invalid DNS query from', rinfo.address);
    return;
  }
  
  const domain = query.name.toLowerCase();
  console.log(`📡 DNS Query: ${domain} from ${rinfo.address}`);
  
  // 🔍 MODE SIMPLE : Seulement les domaines de géolocalisation connus
  const isGeoLocationDomain = GEOLOCATION_DOMAINS.some(geoDomain => 
    domain.includes(geoDomain)
  );
  
  if (isGeoLocationDomain) {
    console.log(`🌍 Géolocalisation détectée: ${domain}`);
    
    // Récupérer l'utilisateur
    const user = await getUserByIP(rinfo.address);
    
    const hasPremiumSubscription = user?.subscriptions?.some(sub => sub.status === 'active');
    if (hasPremiumSubscription) {
      // Utilisateur Premium → Géolocalisation personnalisée
      const selectedRegion = user.settings?.selectedCountry || 'nigeria';
      const geolocator = REGION_GEOLOCATORS[selectedRegion];
      
      if (geolocator) {
        console.log(`🎯 ${user.email} → ${selectedRegion.toUpperCase()} ${geolocator.flag} (${geolocator.ip})`);
        
        const response = createDNSResponse(query, geolocator.ip);
        server.send(response, rinfo.port, rinfo.address);
        
        // Log pour monitoring
        console.log(`✅ Géolocalisation spoofée: ${user.email} → ${geolocator.country} (${geolocator.city})`);
        return;
      }
    } else {
      console.log(`⚠️ Utilisateur non-Premium ou introuvable: ${rinfo.address}`);
    }
  }
  
  // 🔄 Tout le reste → DNS normal (jeu, auth, etc.)
  console.log(`🔄 Forward normal: ${domain}`);
  forwardToCloudflare(msg, rinfo.address, rinfo.port);
}

/**
 * 🚀 Start Server
 */
function startServer() {
  const PORT = 53;
  const HOST = '0.0.0.0';
  
  server.on('message', handleDNSQuery);
  
  server.on('error', (error) => {
    console.error('❌ Server Error:', error.message);
    server.close();
  });
  
  server.bind(PORT, HOST, () => {
    console.log('🎯 LobbyDeZinzin DNS Server démarré');
    console.log(`📡 Écoute sur ${HOST}:${PORT}`);
    console.log('🌍 Domaines géolocalisation:', GEOLOCATION_DOMAINS.join(', '));
    console.log('🎮 Régions disponibles:', Object.keys(REGION_GEOLOCATORS).join(', '));
    console.log('💡 Méthode: DNS Geolocation Spoofing (comme NolagVPN/LobbyGod)');
    console.log('📊 Ping attendu: 8-40ms (trafic jeu reste direct!)');
  });
}

/**
 * 🛑 Graceful Shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur DNS...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ DNS Server arrêté proprement');
    process.exit(0);
  });
});

// 🚀 Démarrage
if (require.main === module) {
  startServer();
}

module.exports = { handleDNSQuery, GEOLOCATION_DOMAINS, REGION_GEOLOCATORS };
