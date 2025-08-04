const dgram = require('dgram');
const dns = require('dns');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const server = dgram.createSocket('udp4');

// Configuration Oracle Cloud Free optimisée
const ORACLE_FREE_TIER = process.env.ORACLE_FREE_TIER === 'true';
const MAX_MEMORY_MB = ORACLE_FREE_TIER ? 1024 : 2048; // Limite mémoire pour Oracle Free

console.log(`🚀 Smart DNS Server - Mode: ${ORACLE_FREE_TIER ? 'Oracle Free Tier' : 'Standard'}`);
console.log(`💾 Limite mémoire: ${MAX_MEMORY_MB}MB`);

// Configuration DNS par région
const REGIONAL_DNS = {
  'nigeria': '196.216.2.1',    // MTN Nigeria - Lobbies faciles
  'taiwan': '168.95.1.1',      // CHT Taiwan - Lobbies modérés  
  'israel': '199.203.56.1',    // Bezeq Israel - Lobbies variés
  'singapore': '165.21.83.88', // SingTel - Lobbies asiatiques
  'brazil': '200.160.2.3',     // NET Brazil - Lobbies sud-américains
  'default': '8.8.8.8'         // Google DNS fallback
};

// Domaines COD/Warzone à intercepter
const COD_DOMAINS = [
  'prod.demonware.net',
  'activision.com',
  'callofduty.com',
  'atvi-prod.net',
  'demonware.net'
];

async function handleDNSQuery(msg, rinfo) {
  try {
    console.log(`🔍 Requête DNS de ${rinfo.address}:${rinfo.port}`);
    
    // Parser la requête DNS
    const query = parseDNSQuery(msg);
    const domain = query.name;
    
    console.log(`📋 Domaine demandé: ${domain}`);
    
    // Vérifier si c'est un domaine COD
    const isCODDomain = COD_DOMAINS.some(codDomain => 
      domain.includes(codDomain)
    );
    
    if (!isCODDomain) {
      // Domaine normal - utiliser DNS Google
      return forwardToGoogleDNS(msg, rinfo);
    }
    
    console.log(`🎮 Domaine COD détecté: ${domain}`);
    
    // Chercher l'utilisateur par IP
    const user = await prisma.user.findFirst({
      where: {
        allowedIPs: {
          contains: rinfo.address
        }
      },
      include: {
        settings: true,
        subscription: true
      }
    });
    
    if (!user) {
      console.log(`❌ IP non autorisée: ${rinfo.address}`);
      return forwardToGoogleDNS(msg, rinfo);
    }
    
    if (!user.subscription || !user.subscription.isActive) {
      console.log(`❌ Utilisateur sans abonnement: ${user.email}`);
      return forwardToGoogleDNS(msg, rinfo);
    }
    
    const selectedRegion = user.settings?.selectedCountry || 'default';
    const targetDNS = REGIONAL_DNS[selectedRegion] || REGIONAL_DNS.default;
    
    console.log(`🌍 ${user.email} → Région: ${selectedRegion} → DNS: ${targetDNS}`);
    
    // Enregistrer l'activité
    await logUserActivity(user.id, domain, selectedRegion, rinfo.address);
    
    // Rediriger vers le DNS régional
    return forwardToRegionalDNS(msg, rinfo, targetDNS);
    
  } catch (error) {
    console.error('❌ Erreur DNS Proxy:', error);
    return forwardToGoogleDNS(msg, rinfo);
  }
}

function parseDNSQuery(buffer) {
  // Parser simple pour extraire le nom de domaine
  let offset = 12; // Header DNS = 12 bytes
  let name = '';
  
  while (offset < buffer.length) {
    const len = buffer[offset];
    if (len === 0) break;
    
    offset++;
    if (name.length > 0) name += '.';
    name += buffer.toString('ascii', offset, offset + len);
    offset += len;
  }
  
  return { name };
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

function forwardToRegionalDNS(msg, rinfo, targetDNS) {
  const client = dgram.createSocket('udp4');
  
  console.log(`🚀 Redirection vers ${targetDNS}`);
  
  client.send(msg, 53, targetDNS, (err) => {
    if (err) {
      console.error(`Erreur forward ${targetDNS}:`, err);
      return forwardToGoogleDNS(msg, rinfo);
    }
  });
  
  client.on('message', (response) => {
    console.log(`✅ Réponse reçue de ${targetDNS}`);
    server.send(response, rinfo.port, rinfo.address);
    client.close();
  });
  
  // Timeout après 5 secondes
  setTimeout(() => {
    client.close();
    console.log(`⏰ Timeout pour ${targetDNS}`);
    forwardToGoogleDNS(msg, rinfo);
  }, 5000);
}

async function logUserActivity(userId, domain, region, clientIP) {
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
    console.log(`📊 Activité enregistrée: ${domain} → ${region}`);
  } catch (error) {
    console.error('Erreur log activité:', error);
  }
}

// Démarrage du serveur DNS
server.on('message', handleDNSQuery);

server.on('listening', () => {
  const address = server.address();
  console.log(`🚀 Smart DNS Proxy démarré sur ${address.address}:${address.port}`);
  console.log('🎮 Interception des domaines COD/Warzone activée');
  console.log('🌍 Redirection régionale basée sur les préférences utilisateur');
});

server.on('error', (err) => {
  console.error('❌ Erreur serveur DNS:', err);
  server.close();
});

// Écouter sur le port 53 (DNS standard)
server.bind(53);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du Smart DNS Proxy...');
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});