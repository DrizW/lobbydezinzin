const dgram = require('dgram');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const server = dgram.createSocket('udp4');

// IPs de serveurs publics par région (pour géolocalisation uniquement)
const GEOLOCATION_IPS = {
  'nigeria': '196.216.2.1',      // IP publique Nigeria
  'taiwan': '168.95.1.1',        // IP publique Taiwan
  'israel': '199.203.56.1',      // IP publique Israel
  'thailand': '203.113.131.1',   // IP publique Thailand
  'default': '8.8.8.8'           // Fallback
};

// Domaines de GÉOLOCALISATION uniquement (pas gameplay)
const GEOLOCATION_DOMAINS = [
  'geo.callofduty.com',
  'geoip.activision.com', 
  'location.callofduty.com',
  'region.activision.com',
  'country.callofduty.com'
];

// Domaines de GAMEPLAY (à laisser passer normalement)
const GAMEPLAY_DOMAINS = [
  'game-servers.callofduty.com',
  'matchmaking.callofduty.com',
  'lobby.callofduty.com'
];

async function handleDNSQuery(msg, rinfo) {
  try {
    const query = parseDNSQuery(msg);
    const domain = query.name;
    
    console.log(`🔍 DNS Query: ${domain} from ${rinfo.address}`);
    
    // Vérifier si c'est un domaine de géolocalisation
    const isGeoLocationDomain = GEOLOCATION_DOMAINS.some(geoDomain => 
      domain.includes(geoDomain)
    );
    
    if (isGeoLocationDomain) {
      console.log(`🌍 Géolocalisation détectée: ${domain}`);
      
      // Chercher l'utilisateur et sa région sélectionnée
      const user = await getUserByIP(rinfo.address);
      
      if (user && user.subscription?.isActive) {
        const selectedRegion = user.settings?.selectedCountry || 'default';
        const geoIP = GEOLOCATION_IPS[selectedRegion];
        
        console.log(`🎯 ${user.email} → Géolocalisation: ${selectedRegion} (${geoIP})`);
        
        // Créer une réponse DNS customisée avec l'IP de géolocalisation
        const response = createCustomDNSResponse(query, geoIP);
        server.send(response, rinfo.port, rinfo.address);
        
        // Logger l'activité
        await logGeoActivity(user.id, domain, selectedRegion, rinfo.address);
        return;
      }
    }
    
    // Pour tous les autres domaines (gameplay, etc.) → DNS normal
    return forwardToGoogleDNS(msg, rinfo);
    
  } catch (error) {
    console.error('❌ Erreur DNS:', error);
    return forwardToGoogleDNS(msg, rinfo);
  }
}

function createCustomDNSResponse(query, targetIP) {
  // Créer une réponse DNS basique avec l'IP de géolocalisation
  const response = Buffer.alloc(64);
  
  // Header DNS (copier de la requête + flags réponse)
  query.buffer.copy(response, 0, 0, 12);
  response[2] = 0x81; // Flags: Response + Authoritative
  response[3] = 0x80;
  
  // Answer section (simple A record)
  let offset = query.nameLength + 16; // Après la question
  
  // Name pointer (compression DNS)
  response[offset] = 0xc0;
  response[offset + 1] = 0x0c;
  offset += 2;
  
  // Type A (IPv4)
  response[offset] = 0x00;
  response[offset + 1] = 0x01;
  offset += 2;
  
  // Class IN
  response[offset] = 0x00;
  response[offset + 1] = 0x01;
  offset += 2;
  
  // TTL (300 seconds)
  response[offset] = 0x00;
  response[offset + 1] = 0x00;
  response[offset + 2] = 0x01;
  response[offset + 3] = 0x2c;
  offset += 4;
  
  // Data length (4 bytes pour IPv4)
  response[offset] = 0x00;
  response[offset + 1] = 0x04;
  offset += 2;
  
  // IP Address (4 bytes)
  const ipParts = targetIP.split('.');
  for (let i = 0; i < 4; i++) {
    response[offset + i] = parseInt(ipParts[i]);
  }
  
  return response.slice(0, offset + 4);
}

function parseDNSQuery(buffer) {
  let offset = 12; // Header DNS = 12 bytes
  let name = '';
  let nameLength = 0;
  
  while (offset < buffer.length) {
    const len = buffer[offset];
    if (len === 0) break;
    
    offset++;
    nameLength++;
    if (name.length > 0) name += '.';
    name += buffer.toString('ascii', offset, offset + len);
    offset += len;
    nameLength += len;
  }
  
  return { 
    name, 
    nameLength: nameLength + 5, // +5 pour null terminator + question type/class
    buffer 
  };
}

async function getUserByIP(clientIP) {
  return await prisma.user.findFirst({
    where: {
      allowedIPs: { contains: clientIP }
    },
    include: {
      settings: true,
      subscriptions: {
        where: {
          status: 'active',
          currentPeriodEnd: { gt: new Date() }
        }
      }
    }
  });
}

function forwardToGoogleDNS(msg, rinfo) {
  const client = dgram.createSocket('udp4');
  
  client.send(msg, 53, '8.8.8.8', (err) => {
    if (err) console.error('Erreur forward Google:', err);
  });
  
  client.on('message', (response) => {
    server.send(response, rinfo.port, rinfo.address);
    client.close();
  });
}

async function logGeoActivity(userId, domain, region, clientIP) {
  try {
    await prisma.dNSLog.create({
      data: {
        userId,
        domain,
        region,
        clientIP,
        timestamp: new Date()
      }
    });
    console.log(`📊 Géolocalisation enregistrée: ${domain} → ${region}`);
  } catch (error) {
    console.error('Erreur log géo:', error);
  }
}

// Démarrage du serveur
server.on('message', handleDNSQuery);

server.on('listening', () => {
  const address = server.address();
  console.log(`🚀 Smart DNS Avancé démarré sur ${address.address}:${address.port}`);
  console.log('🌍 Mode: Géolocalisation sélective (comme NolagVPN)');
  console.log('⚡ Gameplay: Latence normale (pas de proxy)');
  console.log('🎯 Géolocalisation: Selon région sélectionnée');
});

server.bind(53);

process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du Smart DNS Avancé...');
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});