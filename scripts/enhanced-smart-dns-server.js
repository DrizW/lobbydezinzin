const dgram = require('dgram');
const dns = require('dns');
const { PrismaClient } = require('@prisma/client');
const net = require('net');

const prisma = new PrismaClient();
const server = dgram.createSocket('udp4');

// Configuration des PROXIES par région (IP de nos serveurs)
const REGIONAL_PROXIES = {
  'nigeria': {
    dns: '196.216.2.1',
    proxy_ip: '41.216.2.100',    // IP de notre serveur Nigeria
    real_servers: [
      'prod.data.cod.activision.com',
      'matchmaking.callofduty.com'
    ]
  },
  'taiwan': {
    dns: '168.95.1.1', 
    proxy_ip: '1.34.56.78',      // IP de notre serveur Taiwan
    real_servers: [
      'prod.data.cod.activision.com',
      'matchmaking.callofduty.com'
    ]
  },
  'israel': {
    dns: '80.179.54.171',
    proxy_ip: '5.29.15.44',      // IP de notre serveur Israel
    real_servers: [
      'prod.data.cod.activision.com', 
      'matchmaking.callofduty.com'
    ]
  }
};

// Domaines COD/Activision à intercepter
const COD_DOMAINS = [
  'prod.data.cod.activision.com',
  'matchmaking.callofduty.com', 
  'cod.activision.com',
  'uno.callofduty.com',
  'api.callofduty.com',
  'profile.callofduty.com',
  'my.callofduty.com'
];

async function handleDNSQuery(msg, rinfo) {
  try {
    const query = parseDNSQuery(msg);
    const domain = query.name;
    
    console.log(`🔍 DNS Query: ${domain} from ${rinfo.address}`);
    
    // Vérifier si c'est un domaine COD
    const isCODDomain = COD_DOMAINS.some(codDomain => 
      domain.includes(codDomain) || codDomain.includes(domain.split('.').slice(-2).join('.'))
    );
    
    if (!isCODDomain) {
      // Domaine normal - forward normalement
      return forwardToPublicDNS(msg, rinfo);
    }
    
    console.log(`🎮 COD Domain Detected: ${domain}`);
    
    // Chercher l'utilisateur par IP
    const user = await findUserByIP(rinfo.address);
    
    if (!user || !user.hasActiveSubscription) {
      console.log(`❌ Unauthorized IP: ${rinfo.address}`);
      return forwardToPublicDNS(msg, rinfo);
    }
    
    const selectedRegion = user.settings?.selectedCountry || 'nigeria';
    const regionConfig = REGIONAL_PROXIES[selectedRegion];
    
    if (!regionConfig) {
      console.log(`❌ Unknown region: ${selectedRegion}`);
      return forwardToPublicDNS(msg, rinfo);
    }
    
    console.log(`🌍 ${user.email} → Region: ${selectedRegion} → Proxy: ${regionConfig.proxy_ip}`);
    
    // CRUCIAL: Retourner l'IP de NOTRE PROXY au lieu de l'IP réelle d'Activision
    const response = createDNSResponse(query, regionConfig.proxy_ip);
    server.send(response, rinfo.port, rinfo.address);
    
    // Log l'activité
    await logUserActivity(user.id, domain, selectedRegion, rinfo.address);
    
  } catch (error) {
    console.error('❌ DNS Error:', error);
    return forwardToPublicDNS(msg, rinfo);
  }
}

function createDNSResponse(query, proxyIP) {
  // Créer une réponse DNS qui pointe vers notre proxy
  const response = Buffer.alloc(512);
  
  // DNS Header (12 bytes)
  response.writeUInt16BE(query.id, 0);      // Transaction ID
  response.writeUInt16BE(0x8180, 2);        // Flags: Response + Authoritative
  response.writeUInt16BE(1, 4);             // Questions: 1
  response.writeUInt16BE(1, 6);             // Answers: 1
  response.writeUInt16BE(0, 8);             // Authority: 0
  response.writeUInt16BE(0, 10);            // Additional: 0
  
  let offset = 12;
  
  // Question section (copy from original query)
  const questionLength = query.questionLength;
  query.questionData.copy(response, offset);
  offset += questionLength;
  
  // Answer section
  response.writeUInt16BE(0xC00C, offset);   // Name pointer to question
  offset += 2;
  response.writeUInt16BE(1, offset);        // Type: A record
  offset += 2;
  response.writeUInt16BE(1, offset);        // Class: IN
  offset += 2;
  response.writeUInt32BE(300, offset);      // TTL: 5 minutes
  offset += 4;
  response.writeUInt16BE(4, offset);        // Data length: 4 bytes
  offset += 2;
  
  // IP Address (notre proxy)
  const ipParts = proxyIP.split('.').map(part => parseInt(part));
  response.writeUInt8(ipParts[0], offset++);
  response.writeUInt8(ipParts[1], offset++);
  response.writeUInt8(ipParts[2], offset++);
  response.writeUInt8(ipParts[3], offset++);
  
  return response.slice(0, offset);
}

function parseDNSQuery(buffer) {
  const id = buffer.readUInt16BE(0);
  let offset = 12; // Skip header
  
  // Parse question name
  let name = '';
  const startOffset = offset;
  
  while (offset < buffer.length) {
    const len = buffer[offset];
    if (len === 0) {
      offset++;
      break;
    }
    
    if (name.length > 0) name += '.';
    offset++;
    name += buffer.toString('ascii', offset, offset + len);
    offset += len;
  }
  
  const questionLength = offset - startOffset + 4; // +4 for type and class
  const questionData = buffer.slice(startOffset, offset + 4);
  
  return { 
    id, 
    name, 
    questionLength,
    questionData
  };
}

async function findUserByIP(clientIP) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { allowedIPs: { contains: clientIP } },
          { allowedIPs: { contains: clientIP.split('.').slice(0, 3).join('.') } }
        ]
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
    
    return user ? {
      ...user,
      hasActiveSubscription: user.subscriptions.length > 0 || user.role === 'ADMIN'
    } : null;
    
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
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
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

function forwardToPublicDNS(msg, rinfo) {
  const client = dgram.createSocket('udp4');
  
  client.send(msg, 53, '8.8.8.8', (err) => {
    if (err) console.error('Forward error:', err);
  });
  
  client.on('message', (response) => {
    server.send(response, rinfo.port, rinfo.address);
    client.close();
  });
}

// Démarrage du serveur
server.on('message', handleDNSQuery);

server.on('listening', () => {
  const address = server.address();
  console.log(`🚀 Enhanced Smart DNS Server running on ${address.address}:${address.port}`);
  console.log('🎮 COD Domain interception: ACTIVE');
  console.log('🌍 Geographic proxy redirection: ENABLED');
  console.log('💡 Mode: NolagVPN Compatible');
});

server.bind(53);

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Enhanced Smart DNS Server...');
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});