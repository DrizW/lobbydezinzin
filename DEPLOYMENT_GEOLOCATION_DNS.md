# 🚀 Déploiement DNS Geolocation - LobbyDeZinzin

Guide complet pour déployer votre système de géolocalisation DNS (méthode NolagVPN/LobbyGod)

## 🎯 Vue d'ensemble

Votre système fonctionnera EXACTEMENT comme NolagVPN/LobbyGod :
- **Ping optimal** : 8-40ms (trafic de jeu reste direct)
- **Géolocalisation spoofée** : Call of Duty vous voit dans le pays sélectionné
- **Lobbies ciblés** : Matchmaking dans la région choisie
- **Coût réduit** : 14€/mois vs 15-25€/mois concurrents

## 🛠️ Étape 1: Préparer les Mini VPS

### **Locations et coûts**

| Pays | Provider | RAM | Prix/mois | Script |
|------|----------|-----|-----------|--------|
| 🇳🇬 Nigeria | Contabo | 512MB | 3€ | `bash setup-nigeria.sh` |
| 🇹🇼 Taiwan | Linode | 512MB | 4€ | `bash setup-taiwan.sh` |
| 🇲🇦 Maroc | DigitalOcean | 512MB | 3€ | `bash setup-morocco.sh` |
| 🇹🇭 Thaïlande | Vultr | 512MB | 4€ | `bash setup-thailand.sh` |
| 🇰🇪 Kenya | Contabo | 512MB | 4€ | `bash setup-kenya.sh` |

**Total: 14€/mois** pour 5 régions (vs 15€/mois LobbyGod)

### **Commandes d'installation VPS**

```bash
# Sur chaque VPS (Ubuntu 20.04+)

# 🇳🇬 Nigeria
curl -sSL https://raw.githubusercontent.com/votre-repo/scripts/main/install-geolocation-vps.sh | bash -s NG Lagos

# 🇹🇼 Taiwan
curl -sSL https://raw.githubusercontent.com/votre-repo/scripts/main/install-geolocation-vps.sh | bash -s TW Taipei

# 🇲🇦 Maroc  
curl -sSL https://raw.githubusercontent.com/votre-repo/scripts/main/install-geolocation-vps.sh | bash -s MA Casablanca

# 🇹🇭 Thaïlande
curl -sSL https://raw.githubusercontent.com/votre-repo/scripts/main/install-geolocation-vps.sh | bash -s TH Bangkok

# 🇰🇪 Kenya
curl -sSL https://raw.githubusercontent.com/votre-repo/scripts/main/install-geolocation-vps.sh | bash -s KE Nairobi
```

### **Test de validation VPS**

```bash
# Tester chaque VPS après installation
curl -s http://VPS_IP/geoip.json

# Réponse attendue:
{
  "country": "NG",
  "region": "Lagos",
  "status": "success", 
  "timezone": "Africa/Lagos"
}
```

## ⚙️ Étape 2: Configuration DNS Server

### **1. Mise à jour des IP VPS réelles**

```bash
# Éditer le fichier DNS server
nano scripts/geolocation-dns-server.js
```

```javascript
// Remplacer par vos vraies IP VPS
const REGION_GEOLOCATORS = {
  nigeria: {
    ip: 'VOTRE_IP_NIGERIA',    // Remplacer par IP réelle
    country: 'NG',
    flag: '🇳🇬',
    city: 'Lagos'
  },
  taiwan: {
    ip: 'VOTRE_IP_TAIWAN',     // Remplacer par IP réelle  
    country: 'TW',
    flag: '🇹🇼',
    city: 'Taipei'
  },
  morocco: {
    ip: 'VOTRE_IP_MAROC',      // Remplacer par IP réelle
    country: 'MA',
    flag: '🇲🇦',
    city: 'Casablanca'
  },
  thailand: {
    ip: 'VOTRE_IP_THAILANDE',  // Remplacer par IP réelle
    country: 'TH',
    flag: '🇹🇭',
    city: 'Bangkok'
  },
  kenya: {
    ip: 'VOTRE_IP_KENYA',      // Remplacer par IP réelle
    country: 'KE',
    flag: '🇰🇪',
    city: 'Nairobi'  
  }
};
```

### **2. Installation des dépendances**

```bash
# Sur votre serveur principal (VM Ubuntu)
cd /opt/lobbydezinzin

# Installer les dépendances DNS
npm install dgram dns
```

### **3. Configuration des permissions DNS**

```bash
# Permettre à Node.js d'utiliser le port 53
sudo setcap 'cap_net_bind_service=+ep' $(which node)

# Ou alternative: lancer avec sudo
```

## 🚀 Étape 3: Déploiement

### **1. Lancer le serveur DNS**

```bash
# Sur votre VM Ubuntu
cd /opt/lobbydezinzin

# Test en mode développement
sudo node scripts/geolocation-dns-server.js

# Production avec PM2
sudo pm2 start scripts/geolocation-dns-server.js --name "dns-geolocation"
sudo pm2 save
sudo pm2 startup
```

### **2. Configuration du firewall**

```bash
# Ouvrir le port DNS (53)
sudo ufw allow 53/tcp
sudo ufw allow 53/udp
sudo ufw reload
```

### **3. Test du serveur DNS**

```bash
# Test depuis la VM
node scripts/test-geolocation.js

# Test résolution DNS
nslookup telescope.battle.net 192.168.1.31

# Doit retourner une IP de vos VPS (ex: Nigeria)
```

## 🎮 Étape 4: Configuration Client

### **Router/Device Configuration**

```bash
# DNS Primaire: 192.168.1.31 (votre VM)
# DNS Secondaire: 1.1.1.1 (Cloudflare fallback)
```

### **Test Call of Duty**

1. **Configurer DNS** sur votre appareil/routeur : `192.168.1.31`

2. **Lancer Warzone**

3. **Vérifier géolocalisation** :
   - Settings > Account & Network > Network Info  
   - "Geographical Region" doit afficher le pays sélectionné

4. **Vérifier ping** :
   - Ping doit rester 8-40ms
   - Lobbies du pays sélectionné !

## 📊 Étape 5: Monitoring & Maintenance

### **Script de surveillance**

```bash
#!/bin/bash
# monitor-geolocation.sh

echo "🔍 Monitoring Geolocation DNS"

# Test serveur DNS principal
if nslookup google.com 192.168.1.31 > /dev/null; then
  echo "✅ DNS Server: OK"
else
  echo "❌ DNS Server: ERREUR"
fi

# Test VPS géolocalisation
VPS_IPS=("NIGERIA_IP" "TAIWAN_IP" "MOROCCO_IP" "THAILAND_IP" "KENYA_IP")
for ip in "${VPS_IPS[@]}"; do
  if curl -s --max-time 5 "http://$ip/geoip.json" > /dev/null; then
    echo "✅ VPS $ip: OK"
  else
    echo "❌ VPS $ip: ERREUR"
  fi
done

# Test géolocalisation spécifique
echo "🌍 Test géolocalisation telescope.battle.net:"
nslookup telescope.battle.net 192.168.1.31
```

### **Logs et debugging**

```bash
# Voir les logs DNS
sudo pm2 logs dns-geolocation

# Redémarrer le DNS si problème
sudo pm2 restart dns-geolocation

# Test manuel domaine spécifique
node -e "console.log(require('dns').resolve4('telescope.battle.net', console.log))"
```

## 🛡️ Étape 6: Sécurité & Performance

### **Sécurité VPS**

```bash
# Sur chaque VPS
sudo ufw enable
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP pour géolocalisation
sudo fail2ban-client status
```

### **Performance DNS**

```bash
# Cache DNS local (optionnel)
sudo apt install dnsmasq

# Configuration /etc/dnsmasq.conf
cache-size=1000
server=192.168.1.31  # Votre DNS geolocation
server=1.1.1.1       # Fallback
```

## 🎯 Résultats Attendus

### **✅ Fonctionnement optimal :**

- **Ping jeu** : 8-40ms (identique à NolagVPN)
- **Géolocalisation** : Pays sélectionné affiché dans Warzone
- **Lobbies** : Matchmaking dans la région choisie  
- **Stabilité** : 99%+ uptime avec monitoring

### **📈 Avantages vs concurrents :**

| Aspect | Votre Service | NolagVPN | LobbyGod |
|--------|---------------|----------|----------|
| **Ping** | 8-40ms | 8-40ms | 8-40ms |
| **Coût** | 14€/mois | 25€/mois | 15€/mois |
| **Régions** | 5 pays | 6 pays | 4 pays |
| **Setup** | 1 DNS | Config complexe | 1 DNS |
| **Contrôle** | 100% | 0% | 0% |

## 🚨 Dépannage

### **Problèmes courants :**

```bash
# DNS ne résout pas
sudo systemctl status systemd-resolved
sudo pm2 restart dns-geolocation

# VPS géolocalisation inaccessible  
curl -v http://VPS_IP/geoip.json
sudo systemctl restart nginx

# Call of Duty ne change pas de région
# Vider cache DNS
sudo systemctl flush-dns
ipconfig /flushdns  # Windows
```

## 🎉 Validation Finale

### **Checklist de déploiement :**

- [ ] 5 VPS configurés et testés
- [ ] DNS server fonctionnel sur port 53
- [ ] Test résolution domaines Call of Duty
- [ ] Géolocalisation visible dans Warzone
- [ ] Ping optimal maintenu (8-40ms)
- [ ] Monitoring en place
- [ ] Interface utilisateur fonctionnelle

**🎯 Une fois validé, votre service fonctionne EXACTEMENT comme NolagVPN/LobbyGod !**

---

**💡 Support technique :** Les logs détaillés sont dans `pm2 logs dns-geolocation`
