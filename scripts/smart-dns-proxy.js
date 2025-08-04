#!/usr/bin/env node
/**
 * Smart DNS Proxy pour Anti-SBMM Warzone
 * Solution économique utilisant DNS publics régionaux
 * Coût: 0€ (utilise DNS publics) ou 3-5€/mois (1 VPS)
 */

const dgram = require('dgram');
const { promisify } = require('util');

// Configuration DNS publics par région (GRATUITS)
const DNS_REGIONS = {
  nigeria: {
    name: 'Nigeria',
    primary: '196.216.2.1',      // MainOne Cable Nigeria
    secondary: '41.58.184.1',    // WACREN Nigeria
    sbmm_score: 95,              // Très efficace
    timezone: 'Africa/Lagos',
    peak_hours: [18, 19, 20, 21, 22] // Heures de pointe locales
  },
  thailand: {
    name: 'Thaïlande',
    primary: '203.113.131.1',     // CAT Telecom Thailand
    secondary: '203.144.206.205', // TOT Thailand
    sbmm_score: 88,
    timezone: 'Asia/Bangkok',
    peak_hours: [19, 20, 21, 22, 23]
  },
  israel: {
    name: 'Israël',
    primary: '80.179.54.171',     // Bezeq Israel
    secondary: '199.0.2.1',       // Israeli Internet Association
    sbmm_score: 90,
    timezone: 'Asia/Jerusalem',
    peak_hours: [20, 21, 22, 23, 0]
  },
  taiwan: {
    name: 'Taiwan',
    primary: '168.95.1.1',        // HiNet Taiwan
    secondary: '168.95.192.1',    // HiNet Secondary
    sbmm_score: 92,
    timezone: 'Asia/Taipei',
    peak_hours: [19, 20, 21, 22]
  },
  cambodia: {
    name: 'Cambodge',
    primary: '203.144.206.205',   // Ezecom Cambodia
    secondary: '8.8.8.8',         // Google fallback
    sbmm_score: 85,
    timezone: 'Asia/Phnom_Penh',
    peak_hours: [18, 19, 20, 21]
  }
};

// Domaines Call of Duty à intercepter
const COD_DOMAINS = [
  'prod.data.cod.activision.com',
  'cod.activision.com',
  'uno.callofduty.com',
  'matchmaking.callofduty.com',
  'geo.callofduty.com',
  'profile.callofduty.com',
  'my.callofduty.com',
  'api.callofduty.com'
];

class SmartDNSProxy {
  constructor(options = {}) {
    this.port = options.port || 53;
    this.server = dgram.createSocket('udp4');
    this.cache = new Map();
    this.stats = {
      startTime: Date.now(),
      totalRequests: 0,
      codRequests: 0,
      cacheHits: 0,
      regionUsage: {},
      errors: 0
    };
    
    // Configuration avancée
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
    this.dnsTimeout = options.dnsTimeout || 5000; // 5 secondes
    this.enableLatencySimulation = options.enableLatencySimulation || false;
    
    console.log('🎮 Smart DNS Proxy pour Anti-SBMM Warzone');
    console.log('💰 Solution ultra-économique (DNS publics gratuits)');
    console.log(`🌍 ${Object.keys(DNS_REGIONS).length} régions configurées`);
  }

  start() {
    this.server.on('message', async (msg, rinfo) => {
      await this.handleDNSRequest(msg, rinfo);
    });

    this.server.on('error', (err) => {
      console.error('❌ Erreur serveur DNS:', err);
      this.stats.errors++;
    });

    this.server.bind(this.port, () => {
      console.log(`\n🚀 Proxy DNS démarré sur port ${this.port}`);
      this.printConfiguration();
      this.startPeriodicTasks();
    });
  }

  printConfiguration() {
    console.log('\n📊 Configuration des régions:');
    Object.entries(DNS_REGIONS).forEach(([key, region]) => {
      console.log(`   🌍 ${region.name}: ${region.primary} (Efficacité: ${region.sbmm_score}%)`);
    });
    console.log(`\n🎯 Domaines COD surveillés: ${COD_DOMAINS.length}`);
    console.log('⚡ Cache activé avec TTL 5min');
    console.log();
  }

  async handleDNSRequest(message, client) {
    this.stats.totalRequests++;
    
    try {
      const query = this.parseDNSQuery(message);
      if (!query || !query.name) {
        throw new Error('Query DNS invalide');
      }

      const domain = query.name.toLowerCase();
      const cacheKey = `${domain}_${query.type}_${query.class}`;

      // Vérifier le cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          this.stats.cacheHits++;
          this.server.send(cached.response, client.port, client.address);
          return;
        } else {
          this.cache.delete(cacheKey);
        }
      }

      console.log(`🔍 Requête: ${domain} (${client.address}:${client.port})`);

      if (this.isCODDomain(domain)) {
        await this.handleCODRequest(message, client, domain, cacheKey);
      } else {
        await this.handleNormalRequest(message, client, domain, cacheKey);
      }

    } catch (error) {
      console.error(`❌ Erreur traitement DNS: ${error.message}`);
      this.stats.errors++;
      await this.sendErrorResponse(message, client);
    }
  }

  isCODDomain(domain) {
    return COD_DOMAINS.some(codDomain => 
      domain.includes(codDomain.toLowerCase()) ||
      domain.endsWith('.activision.com') ||
      domain.includes('callofduty')
    );
  }

  async handleCODRequest(message, client, domain, cacheKey) {
    this.stats.codRequests++;
    
    // Sélectionner la région optimale
    const region = this.selectOptimalRegion();
    const config = DNS_REGIONS[region];
    
    console.log(`🎯 COD détecté: ${domain} → ${config.name} (Score SBMM: ${config.sbmm_score}%)`);
    
    // Statistiques d'utilisation
    this.stats.regionUsage[region] = (this.stats.regionUsage[region] || 0) + 1;
    
    // Simulation de latence si activée
    if (this.enableLatencySimulation) {
      await this.simulateRegionalLatency(region);
    }

    // Forward vers DNS régional
    await this.forwardToDNS(message, client, config.primary, config.secondary, cacheKey);
  }

  selectOptimalRegion() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Stratégie 1: Éviter les heures de pointe (moins de joueurs pros)
    const availableRegions = Object.entries(DNS_REGIONS).filter(([_, config]) => {
      return !config.peak_hours.includes(currentHour);
    });

    if (availableRegions.length > 0) {
      // Sélectionner par score SBMM parmi les régions hors pic
      const bestRegion = availableRegions.reduce((best, current) => {
        return current[1].sbmm_score > best[1].sbmm_score ? current : best;
      });
      return bestRegion[0];
    }

    // Stratégie 2: Rotation intelligente basée sur l'heure
    const regionRotation = {
      0: 'taiwan',     // Minuit - Asie moins active
      1: 'taiwan',
      2: 'nigeria',    // 2h - Afrique très calme
      3: 'nigeria',
      4: 'nigeria',
      5: 'thailand',   // 5h - Thaïlande calme
      6: 'thailand',
      7: 'israel',     // 7h - Moyen-Orient commence
      8: 'israel',
      9: 'cambodia',   // 9h - Cambodge moins saturé
      10: 'cambodia',
      11: 'taiwan',    // 11h - Taiwan hors pic
      12: 'thailand',  // Midi - Rotation
      13: 'israel',
      14: 'nigeria',   // 14h - Afrique après-midi
      15: 'nigeria',
      16: 'thailand',  // 16h - Asie début soirée
      17: 'taiwan',
      18: 'cambodia',  // 18h - Éviter les gros pays
      19: 'israel',    // 19h - Israël avant pic
      20: 'nigeria',   // 20h - Nigeria encore OK
      21: 'cambodia',  // 21h - Pays moins peuplé
      22: 'thailand',  // 22h - Tard en Asie
      23: 'taiwan'     // 23h - Taiwan nuit
    };

    return regionRotation[currentHour] || 'nigeria';
  }

  async simulateRegionalLatency(region) {
    // Simuler la latence réseau de la région
    const latencyMap = {
      nigeria: 120,    // 120ms vers Nigeria
      thailand: 180,   // 180ms vers Thaïlande
      israel: 90,      // 90ms vers Israël
      taiwan: 200,     // 200ms vers Taiwan
      cambodia: 190    // 190ms vers Cambodge
    };

    const latency = latencyMap[region] || 100;
    await new Promise(resolve => setTimeout(resolve, latency));
  }

  async handleNormalRequest(message, client, domain, cacheKey) {
    // Requêtes non-COD: utiliser DNS rapides
    console.log(`📡 Requête normale: ${domain}`);
    await this.forwardToDNS(message, client, '1.1.1.1', '8.8.8.8', cacheKey);
  }

  async forwardToDNS(message, client, primaryDNS, fallbackDNS, cacheKey) {
    return new Promise((resolve) => {
      const socket = dgram.createSocket('udp4');
      let resolved = false;
      let attempts = 0;

      const tryDNS = (dnsServer) => {
        attempts++;
        socket.send(message, 53, dnsServer, (err) => {
          if (err) {
            console.error(`❌ Erreur envoi vers ${dnsServer}:`, err.message);
            if (fallbackDNS && attempts === 1) {
              console.log(`🔄 Tentative fallback: ${fallbackDNS}`);
              tryDNS(fallbackDNS);
            } else if (!resolved) {
              resolved = true;
              socket.close();
              this.sendErrorResponse(message, client);
              resolve();
            }
          }
        });
      };

      socket.on('message', (response) => {
        if (!resolved) {
          resolved = true;
          
          // Envoyer la réponse au client
          this.server.send(response, client.port, client.address);
          
          // Mettre en cache
          this.cache.set(cacheKey, {
            response: response,
            timestamp: Date.now()
          });
          
          socket.close();
          resolve();
        }
      });

      socket.on('error', (err) => {
        if (!resolved) {
          console.error(`❌ Erreur socket:`, err.message);
          resolved = true;
          socket.close();
          this.sendErrorResponse(message, client);
          resolve();
        }
      });

      // Timeout
      const timeout = setTimeout(() => {
        if (!resolved) {
          console.log(`⏰ Timeout DNS pour ${primaryDNS}`);
          resolved = true;
          socket.close();
          if (fallbackDNS && attempts === 1) {
            this.forwardToDNS(message, client, fallbackDNS, null, cacheKey);
          } else {
            this.sendErrorResponse(message, client);
          }
          resolve();
        }
      }, this.dnsTimeout);

      // Commencer avec DNS primaire
      tryDNS(primaryDNS);
    });
  }

  parseDNSQuery(buffer) {
    try {
      if (buffer.length < 12) return null;

      let offset = 12; // Skip DNS header
      let name = '';
      
      while (offset < buffer.length && buffer[offset] !== 0) {
        const length = buffer[offset];
        if (length === 0) break;
        if (length > 63) break; // DNS label max length
        
        if (name) name += '.';
        if (offset + length + 1 > buffer.length) break;
        
        name += buffer.slice(offset + 1, offset + 1 + length).toString();
        offset += length + 1;
      }
      
      if (offset + 4 >= buffer.length) return null;
      
      const type = buffer.readUInt16BE(offset + 1);
      const dnsClass = buffer.readUInt16BE(offset + 3);
      
      return { name, type, class: dnsClass };
    } catch (error) {
      console.error('❌ Erreur parsing DNS:', error.message);
      return null;
    }
  }

  async sendErrorResponse(originalMessage, client, errorCode = 2) {
    try {
      // Créer une réponse d'erreur DNS
      const response = Buffer.from(originalMessage);
      
      // Modifier les flags pour indiquer une erreur
      response.writeUInt16BE(0x8180 | errorCode, 2); // Response + Error code
      
      this.server.send(response, client.port, client.address);
    } catch (error) {
      console.error('❌ Erreur envoi réponse erreur:', error.message);
    }
  }

  startPeriodicTasks() {
    // Nettoyage du cache toutes les 10 minutes
    setInterval(() => {
      this.cleanCache();
    }, 600000);

    // Statistiques toutes les 5 minutes
    setInterval(() => {
      this.printStats();
    }, 300000);

    // Optimisation mémoire toutes les heures
    setInterval(() => {
      if (global.gc) {
        global.gc();
        console.log('🧹 Garbage collection effectué');
      }
    }, 3600000);
  }

  cleanCache() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cache nettoyé: ${cleaned} entrées expirées supprimées`);
    }
  }

  printStats() {
    const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const codPercentage = this.stats.totalRequests > 0 ? 
      Math.round((this.stats.codRequests / this.stats.totalRequests) * 100) : 0;
    const cacheHitRate = this.stats.totalRequests > 0 ?
      Math.round((this.stats.cacheHits / this.stats.totalRequests) * 100) : 0;

    console.log('\n📊 === STATISTIQUES DNS PROXY ===');
    console.log(`⏱️  Uptime: ${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m`);
    console.log(`📡 Requêtes totales: ${this.stats.totalRequests}`);
    console.log(`🎮 Requêtes COD: ${this.stats.codRequests} (${codPercentage}%)`);
    console.log(`⚡ Cache hits: ${this.stats.cacheHits} (${cacheHitRate}%)`);
    console.log(`❌ Erreurs: ${this.stats.errors}`);
    console.log(`💾 Cache size: ${this.cache.size} entrées`);
    
    if (Object.keys(this.stats.regionUsage).length > 0) {
      console.log('🌍 Utilisation des régions:');
      Object.entries(this.stats.regionUsage)
        .sort(([,a], [,b]) => b - a)
        .forEach(([region, count]) => {
          const percentage = Math.round((count / this.stats.codRequests) * 100);
          console.log(`   ${DNS_REGIONS[region].name}: ${count} (${percentage}%)`);
        });
    }
    console.log('================================\n');
  }

  getStats() {
    return {
      uptime: Math.floor((Date.now() - this.stats.startTime) / 1000),
      ...this.stats,
      cacheSize: this.cache.size,
      regions: Object.keys(DNS_REGIONS)
    };
  }

  stop() {
    console.log('🛑 Arrêt du Smart DNS Proxy...');
    this.server.close(() => {
      console.log('✅ Serveur DNS fermé');
      this.printStats();
      process.exit(0);
    });
  }
}

// Démarrage du proxy
if (require.main === module) {
  const proxy = new SmartDNSProxy({
    port: process.env.DNS_PORT || 53,
    enableLatencySimulation: process.env.SIMULATE_LATENCY === 'true',
    cacheTimeout: parseInt(process.env.CACHE_TIMEOUT) || 300000,
    dnsTimeout: parseInt(process.env.DNS_TIMEOUT) || 5000
  });

  proxy.start();

  // Gestion propre de l'arrêt
  process.on('SIGINT', () => proxy.stop());
  process.on('SIGTERM', () => proxy.stop());
  
  // Gestion des erreurs non capturées
  process.on('uncaughtException', (error) => {
    console.error('❌ Erreur non capturée:', error);
    proxy.stop();
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
  });
}

module.exports = SmartDNSProxy;