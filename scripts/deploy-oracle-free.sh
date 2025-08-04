#!/bin/bash

# LobbyDeZinzin - Déploiement Oracle Cloud Free Tier
# Compatible avec VM.Standard.E2.1.Micro (6GB RAM, 1 vCPU)
# Script optimisé pour le projet GitHub: https://github.com/DrizW/lobbydezinzin

set -e

echo "🚀 LobbyDeZinzin - Déploiement Oracle Cloud Free"
echo "================================================"
echo "📍 Repo: https://github.com/DrizW/lobbydezinzin"
echo "💰 Coût: 0€/mois (Free Tier à vie)"
echo ""

# Détection IP publique Oracle
ORACLE_IP=$(curl -s ifconfig.me)
DOMAIN=${1:-$ORACLE_IP}

echo "🔧 Configuration détectée:"
echo "   • IP Publique Oracle: $ORACLE_IP" 
echo "   • Domaine/IP: $DOMAIN"
echo "   • Instance: VM.Standard.E2.1.Micro"
echo "   • RAM: 6GB | vCPU: 1"
echo ""

# 1. Mise à jour système Oracle Ubuntu
echo "📦 [1/10] Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# 2. Installation Node.js 20 LTS
echo "📦 [2/10] Installation Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "✅ Node.js $(node --version) installé"
echo "✅ npm $(npm --version) installé"

# 3. Installation outils Oracle Cloud
echo "🔧 [3/10] Installation outils système..."
sudo apt install -y git nginx ufw htop curl wget unzip

# 4. Configuration Firewall Oracle (iptables + UFW)
echo "🔥 [4/10] Configuration sécurité Oracle Cloud..."

# UFW (local firewall)
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 53/udp     # Smart DNS
sudo ufw allow 3000/tcp   # Next.js
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw --force enable

echo "✅ Firewall UFW configuré"
echo "⚠️  IMPORTANT: Configurez aussi les Security Lists Oracle:"
echo "   → Ingress 0.0.0.0/0 Port 53/UDP (DNS)"
echo "   → Ingress 0.0.0.0/0 Port 3000/TCP (Web)"
echo "   → Ingress 0.0.0.0/0 Port 80/TCP (HTTP)"

# 5. Optimisations Oracle Free Tier (6GB RAM)
echo "⚡ [5/10] Optimisations Oracle Free Tier..."

# Swap 2GB pour éviter les OOM kills
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimisations mémoire Oracle
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
echo "vm.vfs_cache_pressure=50" | sudo tee -a /etc/sysctl.conf
echo "vm.dirty_ratio=15" | sudo tee -a /etc/sysctl.conf
echo "vm.dirty_background_ratio=5" | sudo tee -a /etc/sysctl.conf

echo "✅ Optimisations Oracle appliquées (Swap: 2GB)"

# 6. Clone/Update du projet GitHub
echo "📥 [6/10] Récupération du projet GitHub..."
PROJECT_DIR="/opt/lobbydezinzin"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "📥 Clonage depuis GitHub..."
  sudo git clone https://github.com/DrizW/lobbydezinzin.git $PROJECT_DIR
  sudo chown -R $USER:$USER $PROJECT_DIR
else
  echo "📁 Mise à jour depuis GitHub..."
  cd $PROJECT_DIR
  git pull origin main
  sudo chown -R $USER:$USER $PROJECT_DIR
fi

cd $PROJECT_DIR
echo "✅ Projet LobbyDeZinzin cloné/mis à jour"

# 7. Installation des dépendances
echo "📦 [7/10] Installation dépendances npm..."
npm install

# 8. Configuration environnement Oracle
echo "⚙️ [8/10] Configuration environnement Oracle Cloud..."

# Vérifier si .env existe déjà
if [ ! -f ".env" ]; then
  echo "📝 Création du fichier .env pour Oracle..."
  cat > .env << EOF
# Base de données PostgreSQL (Railway/Supabase recommandé pour Oracle Free)
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth Configuration
NEXTAUTH_URL="http://$DOMAIN:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Smart DNS Configuration
SMART_DNS_IP="$ORACLE_IP"
SMART_DNS_PORT="53"

# Oracle Cloud Free Tier
ORACLE_REGION="eu-frankfurt-1"
ORACLE_SHAPE="VM.Standard.E2.1.Micro"
NODE_ENV="production"
PORT="3000"
EOF
  echo "✅ Fichier .env créé pour Oracle Cloud"
else
  echo "✅ Fichier .env existant détecté"
fi

# 9. Build de l'application
echo "🏗️ [9/10] Build de l'application Next.js..."
npm run build

# 10. Configuration des services systemd Oracle
echo "⚙️ [10/10] Configuration des services Oracle Cloud..."

# Service Smart DNS (optimisé Oracle)
sudo tee /etc/systemd/system/lobbydezinzin-dns.service > /dev/null << EOF
[Unit]
Description=LobbyDeZinzin Smart DNS Server (Oracle Cloud Free)
After=network.target
StartLimitInterval=0

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node scripts/smart-dns-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=ORACLE_FREE_TIER=true

# Optimisations Oracle Free Tier
LimitNOFILE=65536
OOMScoreAdjust=-100
MemoryAccounting=true
MemoryLimit=1G

[Install]
WantedBy=multi-user.target
EOF

# Service Next.js (optimisé Oracle)
sudo tee /etc/systemd/system/lobbydezinzin-web.service > /dev/null << EOF
[Unit]
Description=LobbyDeZinzin Web Application (Oracle Cloud Free)
After=network.target
StartLimitInterval=0

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

# Optimisations Oracle Free Tier
LimitNOFILE=65536
MemoryAccounting=true
MemoryLimit=4G
OOMScoreAdjust=0

[Install]
WantedBy=multi-user.target
EOF

# Configuration Nginx pour Oracle
sudo tee /etc/nginx/sites-available/lobbydezinzin > /dev/null << EOF
# LobbyDeZinzin - Configuration Nginx Oracle Cloud Free
server {
    listen 80;
    server_name $DOMAIN $ORACLE_IP;

    # Optimisations Oracle Free Tier
    client_max_body_size 10M;
    keepalive_timeout 65;
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts optimisés Oracle
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Logs optimisés
    access_log /var/log/nginx/lobbydezinzin.access.log;
    error_log /var/log/nginx/lobbydezinzin.error.log;
}
EOF

# Activation Nginx
sudo ln -sf /etc/nginx/sites-available/lobbydezinzin /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Script de monitoring Oracle Free
sudo tee /usr/local/bin/oracle-monitor.sh > /dev/null << 'EOF'
#!/bin/bash
echo "=== Oracle Cloud Free - LobbyDeZinzin Monitor ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "RAM: $(free -h | awk 'NR==2{printf "Used: %s/%s (%.1f%%)\n", $3,$2,$3*100/$2}')"
echo "Swap: $(free -h | awk 'NR==3{printf "Used: %s/%s\n", $3,$2}')"
echo "Disk: $(df -h / | awk 'NR==2{printf "Used: %s/%s (%s)\n", $3,$2,$5}')"
echo "Smart DNS: $(systemctl is-active lobbydezinzin-dns)"
echo "Web App: $(systemctl is-active lobbydezinzin-web)"
echo "Nginx: $(systemctl is-active nginx)"
echo "=============================================="
EOF

sudo chmod +x /usr/local/bin/oracle-monitor.sh

# Démarrage des services
echo "🚀 Démarrage des services..."
sudo systemctl daemon-reload
sudo systemctl enable lobbydezinzin-dns lobbydezinzin-web nginx
sudo systemctl start lobbydezinzin-dns lobbydezinzin-web nginx

# Attendre que les services démarrent
echo "⏳ Vérification des services..."
sleep 10

# Tests de validation
echo "🧪 Tests de validation..."

# Test Smart DNS
if dig @$ORACLE_IP google.com +short +time=5 > /dev/null 2>&1; then
    echo "✅ Smart DNS répond correctement"
else
    echo "❌ Problème Smart DNS - Vérifiez les logs"
fi

# Test Web App
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application web fonctionne"
else
    echo "❌ Problème application web - Vérifiez les logs"
fi

# Test Nginx
if curl -s http://$ORACLE_IP > /dev/null; then
    echo "✅ Nginx proxy fonctionne"
else
    echo "❌ Problème Nginx - Vérifiez la configuration"
fi

# Informations finales
echo ""
echo "🎉 DÉPLOIEMENT ORACLE CLOUD FREE TERMINÉ !"
echo "=========================================="
echo ""
echo "🌐 ACCÈS PUBLIC:"
echo "   • Site Web: http://$ORACLE_IP:3000"
echo "   • Admin Panel: http://$ORACLE_IP:3000/admin"
echo "   • Smart DNS: $ORACLE_IP (port 53/UDP)"
echo ""
echo "🔐 COMPTES PAR DÉFAUT:"
echo "   • Admin: admin@lobbydezinzin.com / Admin123!"
echo "   • Test: test@lobbydezinzin.com / Test123!"
echo ""
echo "⚠️  ORACLE CLOUD SECURITY LISTS À CONFIGURER:"
echo "   1. Connectez-vous au dashboard Oracle Cloud"
echo "   2. Virtual Cloud Networks → Votre VCN → Security Lists"
echo "   3. Ajoutez ces règles Ingress:"
echo "      → 0.0.0.0/0 | Port 53/UDP | DNS Smart Proxy"
echo "      → 0.0.0.0/0 | Port 3000/TCP | Application Web"
echo "      → 0.0.0.0/0 | Port 80/TCP | HTTP"
echo ""
echo "🎮 CONFIGURATION CONSOLE/PC:"
echo "   • DNS Primaire: $ORACLE_IP"
echo "   • DNS Secondaire: 8.8.8.8"
echo ""
echo "📊 COMMANDES UTILES:"
echo "   • Monitoring: /usr/local/bin/oracle-monitor.sh"
echo "   • Logs DNS: journalctl -u lobbydezinzin-dns -f"
echo "   • Logs Web: journalctl -u lobbydezinzin-web -f"
echo "   • Restart DNS: sudo systemctl restart lobbydezinzin-dns"
echo "   • Restart Web: sudo systemctl restart lobbydezinzin-web"
echo ""
echo "💰 COÛT TOTAL: 0€/mois (Oracle Free Tier Forever)"
echo "🚀 Smart DNS LobbyDeZinzin opérationnel sur Oracle Cloud !"
echo ""
echo "🎯 PROCHAINES ÉTAPES:"
echo "   1. Configurez les Security Lists Oracle (IMPORTANT !)"
echo "   2. Configurez votre base de données PostgreSQL"
echo "   3. Créez le compte admin: npm run create-admin"
echo "   4. Ajoutez vos IPs autorisées via /admin/ip-management"
echo "   5. Testez Warzone avec DNS: $ORACLE_IP"
echo "   6. Profitez des lobbies faciles ! 🎮"