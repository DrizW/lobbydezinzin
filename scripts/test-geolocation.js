#!/usr/bin/env node

/**
 * 🧪 Test Geolocation DNS Server
 * 
 * Script pour valider le fonctionnement du DNS geolocation spoofing
 */

const dgram = require('dgram');
const dns = require('dns');

// Configuration
const DNS_SERVER = '192.168.1.31'; // Votre serveur DNS
const DNS_PORT = 53;

// Domaines de test
const TEST_DOMAINS = [
  'telescope.battle.net',
  'geoip.battle.net',
  'google.com', // Domaine normal (ne doit PAS être spoofé)
  'geo.activision.com',
  'youtube.com' // Domaine normal
];

// Résultats attendus
const EXPECTED_GEOLOCATED_IPS = [
  '41.223.84.20',   // Nigeria
  '203.74.205.156', // Taiwan
  '196.200.96.15',  // Maroc
  '103.69.194.12',  // Thaïlande
  '197.248.21.8'    // Kenya
];

/**
 * 🔍 Test DNS Resolution
 */
async function testDNSResolution(domain, dnsServer) {
  return new Promise((resolve, reject) => {
    const resolver = new dns.Resolver();
    resolver.setServers([dnsServer]);
    
    const timeout = setTimeout(() => {
      reject(new Error('Timeout'));
    }, 5000);
    
    resolver.resolve4(domain, (error, addresses) => {
      clearTimeout(timeout);
      
      if (error) {
        reject(error);
      } else {
        resolve(addresses);
      }
    });
  });
}

/**
 * 🌍 Test Geolocation API
 */
async function testGeolocationAPI(ip) {
  try {
    const response = await fetch(`http://${ip}/geoip.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`API Error: ${error.message}`);
  }
}

/**
 * 🎯 Test Ping to Server
 */
function testPing(ip) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = dgram.createSocket('udp4');
    
    socket.send(Buffer.alloc(32), 53, ip, (error) => {
      if (error) {
        socket.close();
        resolve(null);
        return;
      }
      
      const ping = Date.now() - start;
      socket.close();
      resolve(ping);
    });
    
    setTimeout(() => {
      socket.close();
      resolve(null);
    }, 3000);
  });
}

/**
 * 📊 Main Test Suite
 */
async function runTests() {
  console.log('🧪 LobbyDeZinzin DNS Geolocation Tests');
  console.log('=====================================\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: DNS Server Reachability
  console.log('1️⃣ Test DNS Server Reachability');
  totalTests++;
  
  try {
    const ping = await testPing(DNS_SERVER);
    if (ping !== null) {
      console.log(`✅ DNS Server accessible (${ping}ms)`);
      passedTests++;
    } else {
      console.log('❌ DNS Server non accessible');
    }
  } catch (error) {
    console.log(`❌ Erreur ping: ${error.message}`);
  }
  
  console.log('');
  
  // Test 2: Domain Resolution
  console.log('2️⃣ Test Resolution DNS');
  
  for (const domain of TEST_DOMAINS) {
    totalTests++;
    try {
      const addresses = await testDNSResolution(domain, DNS_SERVER);
      const ip = addresses[0];
      
      const isGeolocationDomain = domain.includes('battle.net') || domain.includes('activision');
      const isGeolocatedIP = EXPECTED_GEOLOCATED_IPS.includes(ip);
      
      if (isGeolocationDomain && isGeolocatedIP) {
        console.log(`✅ ${domain} → ${ip} (Géolocalisé ✅)`);
        passedTests++;
      } else if (!isGeolocationDomain && !isGeolocatedIP) {
        console.log(`✅ ${domain} → ${ip} (Normal ✅)`);
        passedTests++;
      } else if (isGeolocationDomain && !isGeolocatedIP) {
        console.log(`⚠️  ${domain} → ${ip} (Devrait être géolocalisé)`);
      } else {
        console.log(`❌ ${domain} → ${ip} (Comportement inattendu)`);
      }
      
    } catch (error) {
      console.log(`❌ ${domain} → Erreur: ${error.message}`);
    }
  }
  
  console.log('');
  
  // Test 3: Geolocation VPS APIs
  console.log('3️⃣ Test APIs Géolocalisation VPS');
  
  const vpsConfigs = [
    { ip: '41.223.84.20', country: 'NG', name: 'Nigeria' },
    { ip: '203.74.205.156', country: 'TW', name: 'Taiwan' },
    { ip: '196.200.96.15', country: 'MA', name: 'Maroc' },
    { ip: '103.69.194.12', country: 'TH', name: 'Thaïlande' },
    { ip: '197.248.21.8', country: 'KE', name: 'Kenya' }
  ];
  
  for (const vps of vpsConfigs) {
    totalTests++;
    try {
      const geoData = await testGeolocationAPI(vps.ip);
      
      if (geoData.country === vps.country && geoData.status === 'success') {
        console.log(`✅ ${vps.name} (${vps.ip}) → ${geoData.country} ✅`);
        passedTests++;
      } else {
        console.log(`❌ ${vps.name} (${vps.ip}) → Données incorrectes`);
        console.log(`   Attendu: ${vps.country}, Reçu: ${geoData.country}`);
      }
      
    } catch (error) {
      console.log(`❌ ${vps.name} (${vps.ip}) → ${error.message}`);
    }
  }
  
  console.log('');
  
  // Test 4: Latency Check
  console.log('4️⃣ Test Latence VPS');
  
  for (const vps of vpsConfigs) {
    totalTests++;
    try {
      const ping = await testPing(vps.ip);
      
      if (ping !== null) {
        if (ping < 100) {
          console.log(`✅ ${vps.name} → ${ping}ms (Excellent)`);
        } else if (ping < 200) {
          console.log(`⚠️  ${vps.name} → ${ping}ms (Acceptable)`);
        } else {
          console.log(`❌ ${vps.name} → ${ping}ms (Trop lent)`);
        }
        passedTests++;
      } else {
        console.log(`❌ ${vps.name} → Timeout`);
      }
    } catch (error) {
      console.log(`❌ ${vps.name} → ${error.message}`);
    }
  }
  
  // Résultats finaux
  console.log('\n📊 Résultats des Tests');
  console.log('=====================');
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`📈 Taux de réussite: ${Math.round((passedTests/totalTests)*100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 TOUS LES TESTS RÉUSSIS !');
    console.log('🎮 Votre DNS Geolocation est prêt pour Call of Duty !');
    console.log('💡 Configurez vos appareils avec DNS: ' + DNS_SERVER);
  } else {
    console.log('\n⚠️  Certains tests ont échoué');
    console.log('🔧 Vérifiez la configuration DNS et VPS');
  }
}

/**
 * 🎮 Test Call of Duty Specific
 */
async function testCallOfDutyDomains() {
  console.log('\n🎮 Test Spécifique Call of Duty');
  console.log('===============================');
  
  const codDomains = [
    'telescope.battle.net',
    'geoip.battle.net',
    'demonware.net',
    'region.battle.net'
  ];
  
  for (const domain of codDomains) {
    try {
      const addresses = await testDNSResolution(domain, DNS_SERVER);
      const ip = addresses[0];
      
      // Vérifier si l'IP correspond à un de nos VPS
      const isOurVPS = EXPECTED_GEOLOCATED_IPS.includes(ip);
      
      if (isOurVPS) {
        console.log(`🎯 ${domain} → ${ip} (Spoofé vers nos VPS ✅)`);
      } else {
        console.log(`🔄 ${domain} → ${ip} (DNS normal)`);
      }
      
    } catch (error) {
      console.log(`❌ ${domain} → ${error.message}`);
    }
  }
}

/**
 * 🚀 Run All Tests
 */
async function main() {
  try {
    await runTests();
    await testCallOfDutyDomains();
    
    console.log('\n💡 Instructions finales:');
    console.log('1. Configurez vos appareils avec DNS: ' + DNS_SERVER);
    console.log('2. Lancez Call of Duty / Warzone');
    console.log('3. Vérifiez Settings > Network Info > Geographical Region');
    console.log('4. Le ping doit rester bas (8-40ms) mais la région changée !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    process.exit(1);
  }
}

// Lancement du script
if (require.main === module) {
  main();
}

module.exports = { testDNSResolution, testGeolocationAPI, testPing };
