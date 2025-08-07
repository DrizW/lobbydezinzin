# 🌍 Mini VPS Setup Guide - Géolocalisation

Guide pour configurer les mini VPS de géolocalisation (comme NolagVPN/LobbyGod)

## 🎯 Infrastructure nécessaire

### **💰 Coût total: 14€/mois**

| Pays | Provider | RAM | Prix/mois | IP Exemple |
|------|----------|-----|-----------|------------|
| 🇳🇬 Nigeria | Contabo/OVH | 512MB | 3€ | 41.223.84.20 |
| 🇹🇼 Taiwan | Linode | 512MB | 4€ | 203.74.205.156 |
| 🇲🇦 Maroc | DigitalOcean | 512MB | 3€ | 196.200.96.15 |
| 🇹🇭 Thaïlande | Vultr | 512MB | 4€ | 103.69.194.12 |
| 🇰🇪 Kenya | Contabo | 512MB | 4€ | 197.248.21.8 |

**Note**: Ces VPS servent UNIQUEMENT pour la géolocalisation, pas pour le trafic de jeu !

## 🛠️ Configuration automatique

### **Script d'installation unique**

```bash
#!/bin/bash
# install-geolocation-vps.sh

set -e

COUNTRY_CODE=${1:-"NG"}
CITY=${2:-"Lagos"}

echo "🌍 Configuration VPS Géolocalisation: $COUNTRY_CODE ($CITY)"

# Mise à jour système
apt update && apt upgrade -y
apt install -y nginx curl jq

# Configuration Nginx minimaliste
cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html;
    
    server_name _;
    
    # API Géolocalisation
    location /geoip.json {
        add_header Content-Type application/json;
        add_header Access-Control-Allow-Origin *;
        return 200 '{"country":"$COUNTRY_CODE","region":"$CITY","status":"success","timezone":"Africa/Lagos"}';
    }
    
    # Page par défaut
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

# Page d'accueil simple
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Geolocation Server - $COUNTRY_CODE</title>
</head>
<body>
    <h1>🌍 LobbyDeZinzin Geolocation Server</h1>
    <p><strong>Country:</strong> $COUNTRY_CODE</p>
    <p><strong>City:</strong> $CITY</p>
    <p><strong>Status:</strong> ✅ Active</p>
    <p><strong>Purpose:</strong> DNS Geolocation Spoofing</p>
    
    <hr>
    <p><em>Ce serveur ne traite que les requêtes de géolocalisation.</em></p>
    <p><em>Le trafic de jeu reste direct pour un ping optimal !</em></p>
</body>
</html>
EOF

# Redémarrer Nginx
systemctl restart nginx
systemctl enable nginx

# Firewall basique
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "✅ VPS Géolocalisation configuré: $COUNTRY_CODE"
echo "🌐 Test: curl http://$(curl -s ifconfig.me)/geoip.json"
echo "📍 IP Publique: $(curl -s ifconfig.me)"

# Test automatique
sleep 2
curl -s "http://localhost/geoip.json" | jq .
```

## 🚀 Déploiement rapide

### **Commandes par pays:**

```bash
# 🇳🇬 Nigeria
wget -O - https://raw.githubusercontent.com/lobbydezinzin/scripts/main/install-geolocation-vps.sh | bash -s NG Lagos

# 🇹🇼 Taiwan  
wget -O - https://raw.githubusercontent.com/lobbydezinzin/scripts/main/install-geolocation-vps.sh | bash -s TW Taipei

# 🇲🇦 Maroc
wget -O - https://raw.githubusercontent.com/lobbydezinzin/scripts/main/install-geolocation-vps.sh | bash -s MA Casablanca

# 🇹🇭 Thaïlande
wget -O - https://raw.githubusercontent.com/lobbydezinzin/scripts/main/install-geolocation-vps.sh | bash -s TH Bangkok

# 🇰🇪 Kenya
wget -O - https://raw.githubusercontent.com/lobbydezinzin/scripts/main/install-geolocation-vps.sh | bash -s KE Nairobi
```

## 🔍 Validation

### **Test de fonctionnement:**

```bash
# Test géolocalisation
curl -s http://VPS_IP/geoip.json

# Réponse attendue:
{
  "country": "NG",
  "region": "Lagos", 
  "status": "success",
  "timezone": "Africa/Lagos"
}
```

### **Test DNS depuis votre serveur principal:**

```bash
# Tester résolution DNS
nslookup telescope.battle.net 192.168.1.31

# Doit retourner l'IP du VPS Nigeria si région sélectionnée
```

## ⚙️ Configuration DNS Server

### **Mise à jour geolocation-dns-server.js:**

```javascript
// Remplacer les IP par vos vraies IP VPS
const REGION_GEOLOCATORS = {
  nigeria: {
    ip: 'VOTRE_IP_NIGERIA',   // Remplacer
    country: 'NG',
    flag: '🇳🇬',
    city: 'Lagos'
  },
  taiwan: {
    ip: 'VOTRE_IP_TAIWAN',    // Remplacer
    country: 'TW', 
    flag: '🇹🇼',
    city: 'Taipei'
  },
  // ... etc
};
```

## 📊 Monitoring

### **Script de surveillance:**

```bash
#!/bin/bash
# monitor-geolocation-vps.sh

VPS_IPS=(
  "NIGERIA_IP"
  "TAIWAN_IP" 
  "MOROCCO_IP"
  "THAILAND_IP"
  "KENYA_IP"
)

for ip in "${VPS_IPS[@]}"; do
  echo "🔍 Test $ip"
  
  # Test HTTP
  if curl -s --max-time 5 "http://$ip/geoip.json" > /dev/null; then
    echo "✅ $ip - OK"
  else
    echo "❌ $ip - ERREUR"
  fi
done
```

## 🎮 Test Final Call of Duty

### **Validation complète:**

1. **Configurer DNS** sur votre routeur/PC: `192.168.1.31`

2. **Lancer Warzone**

3. **Vérifier géolocalisation:**
   - Settings > Account & Network > Network Info
   - "Geographical Region" doit afficher le pays sélectionné

4. **Vérifier ping:**
   - Ping doit rester 8-40ms (serveurs locaux)
   - Mais lobbies du pays sélectionné !

## 💡 Avantages

✅ **Ping optimal** (8-40ms comme NolagVPN)  
✅ **Coût réduit** (14€/mois vs 15-25€/mois concurrents)  
✅ **Géolocalisation parfaite**  
✅ **Setup simple** (3 commandes par VPS)  
✅ **Maintenance minimale**  

## 🔧 Dépannage

### **Problèmes courants:**

```bash
# DNS ne résout pas
systemctl status nginx
curl -s http://localhost/geoip.json

# Firewall bloque
ufw status
ufw allow 80/tcp

# IP géolocalisation incorrecte  
curl -s https://ipapi.co/json | jq .country_code
```

---

**🎯 Une fois configuré, votre service fonctionnera EXACTEMENT comme NolagVPN/LobbyGod !**
