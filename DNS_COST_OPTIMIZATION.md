#!/usr/bin/env node
/**
 * Smart DNS Proxy pour contourner SBMM à coût minimal
 * Utilise des DNS publics + redirection intelligente
 */

const dns = require('dns');
const dgram = require('dgram');

// Configuration des DNS par région (GRATUIT)
const DNS_REGIONS = {
  'nigeria': {
    primary: '8.8.8.8',      // Google Public DNS
    secondary: '1.1.1.1',    // Cloudflare
    country_code: 'NG',
    latency_boost: 50        // Simule latence Nigeria
  },
  'thailand': {
    primary: '208.67.222.222', // OpenDNS
    secondary: '9.9.9.9',      // Quad9
    country_code: 'TH',
    latency_boost: 80
  },
  'israel': {
    primary: '8.26.56.26',     // Comodo
    secondary: '76.76.19.19',  // Alternate DNS
    country_code: 'IL',
    latency_boost: 40
  },
  'taiwan': {
    primary: '168.95.1.1',     // HiNet (Taiwan)
    secondary: '168.95.192.1', // HiNet Secondary
    country_code: 'TW',
    latency_boost: 70
  }
};

// Domaines Warzone à rediriger
const WARZONE_DOMAINS = [
  'prod.data.cod.activision.com',
  'cod.activision.com',
  'uno.callofduty.com',
  'matchmaking.callofduty.com',
  'geo.callofduty.com'
];

class SmartDNSProxy {
  constructor(port = 53) {
    this.server = dgram.createSocket('udp4');
    this.port = port;
    this.stats = {
      requests: 0,
      redirected: 0,
      regions: {}
    };
  }

  start() {
    this.server.on('message', (msg, rinfo) => {
      this.handleDNSQuery(msg, rinfo);
    });

    this.server.bind(this.port, () => {
      console.log(`🌍 Smart DNS Proxy démarré sur port ${this.port}`);
      console.log('📊 Régions disponibles:', Object.keys(DNS_REGIONS));
    });
  }

  handleDNSQuery(message, client) {
    this.stats.requests++;
    
    try {
      const query = this.parseDNSQuery(message);
      const domain = query.domain;
      
      console.log(`🔍 Requête DNS: ${domain} de ${client.address}`);

      // Vérifier si c'est un domaine Warzone
      if (this.isWarzoneRelated(domain)) {
        this.handleWarzoneQuery(message, client, domain);
      } else {
        // Requête normale - utiliser DNS public
        this.forwardToPublicDNS(message, client);
      }
    } catch (error) {
      console.error('❌ Erreur DNS:', error);
      this.sendErrorResponse(client);
    }
  }

  isWarzoneRelated(domain) {
    return WARZONE_DOMAINS.some(pattern => 
      domain.includes(pattern) || domain.endsWith('.activision.com')
    );
  }

  async handleWarzoneQuery(message, client, domain) {
    // Déterminer la meilleure région basée sur l'IP client
    const clientRegion = this.detectClientRegion(client.address);
    const targetRegion = this.selectBestRegion(clientRegion);
    
    console.log(`🎮 Redirection Warzone: ${domain} → ${targetRegion}`);
    
    this.stats.redirected++;
    this.stats.regions[targetRegion] = (this.stats.regions[targetRegion] || 0) + 1;

    // Rediriger vers le DNS de la région cible
    const dnsConfig = DNS_REGIONS[targetRegion];
    await this.forwardToDNS(message, client, dnsConfig.primary);
  }

  detectClientRegion(ip) {
    // Détection basique par IP (à améliorer avec GeoIP)
    if (ip.startsWith('192.168') || ip.startsWith('10.') || ip === '127.0.0.1') {
      return 'local'; // IP privée
    }
    
    // Simulation basée sur ranges IP
    const firstOctet = parseInt(ip.split('.')[0]);
    if (firstOctet >= 80 && firstOctet <= 90) return 'europe';
    if (firstOctet >= 100 && firstOctet <= 120) return 'asia';
    if (firstOctet >= 200 && firstOctet <= 220) return 'africa';
    
    return 'default';
  }

  selectBestRegion(clientRegion) {
    // Logique pour sélectionner la meilleure région pour SBMM
    const regionPriority = {
      'europe': ['israel', 'nigeria', 'thailand'],
      'asia': ['thailand', 'taiwan', 'israel'],
      'africa': ['nigeria', 'israel', 'thailand'],
      'default': ['nigeria', 'thailand', 'israel', 'taiwan']
    };

    const priorities = regionPriority[clientRegion] || regionPriority.default;
    return priorities[Math.floor(Math.random() * Math.min(2, priorities.length))];
  }

  async forwardToDNS(message, client, dnsServer) {
    return new Promise((resolve) => {
      const forwardSocket = dgram.createSocket('udp4');
      
      forwardSocket.send(message, 53, dnsServer, (err) => {
        if (err) {
          console.error(`❌ Erreur forwarding vers ${dnsServer}:`, err);
          this.forwardToPublicDNS(message, client);
          return resolve();
        }
      });

      forwardSocket.on('message', (response) => {
        this.server.send(response, client.port, client.address);
        forwardSocket.close();
        resolve();
      });

      // Timeout après 5 secondes
      setTimeout(() => {
        forwardSocket.close();
        this.forwardToPublicDNS(message, client);
        resolve();
      }, 5000);
    });
  }

  forwardToPublicDNS(message, client) {
    // Fallback vers Google DNS
    this.forwardToDNS(message, client, '8.8.8.8');
  }

  parseDNSQuery(message) {
    // Parser basique DNS (simplifié)
    const domain = this.extractDomainFromQuery(message);
    return { domain };
  }

  extractDomainFromQuery(buffer) {
    // Extraction simplifiée du nom de domaine
    let offset = 12; // Skip DNS header
    let domain = '';
    
    while (offset < buffer.length) {
      const length = buffer[offset];
      if (length === 0) break;
      
      if (domain) domain += '.';
      domain += buffer.slice(offset + 1, offset + 1 + length).toString();
      offset += length + 1;
    }
    
    return domain;
  }

  sendErrorResponse(client) {
    // Envoyer une réponse d'erreur DNS
    const errorResponse = Buffer.alloc(12);
    errorResponse.writeUInt16BE(0x8182, 2); // Response with error
    this.server.send(errorResponse, client.port, client.address);
  }

  getStats() {
    return {
      ...this.stats,
      uptime: process.uptime(),
      regions_usage: this.stats.regions
    };
  }
}

// Démarrage du serveur
if (require.main === module) {
  const proxy = new SmartDNSProxy();
  proxy.start();

  // Stats périodiques
  setInterval(() => {
    console.log('📊 Stats:', proxy.getStats());
  }, 60000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du Smart DNS Proxy...');
    console.log('📊 Stats finales:', proxy.getStats());
    process.exit(0);
  });
}

module.exports = SmartDNSProxy;