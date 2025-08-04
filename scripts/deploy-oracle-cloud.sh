#!/bin/bash

# Script de déploiement LobbyDeZinzin sur Oracle Cloud Free
# Compatible avec les VMs Oracle Cloud (Ubuntu 22.04)

set -e

echo "🚀 Déploiement LobbyDeZinzin sur Oracle Cloud Free"
echo "==============================================="

# Variables Oracle Cloud
ORACLE_SHAPE="VM.Standard.E2.1.Micro"  # Free tier
ORACLE_RAM="6GB"
ORACLE_VCPU="1"

# Détection IP publique Oracle
ORACLE_PUBLIC_IP=$(curl -s ifconfig.me)
echo "🌐 IP Publique Oracle: $ORACLE_PUBLIC_IP"

# 1. Mise à jour système Oracle
echo "📦 Mise à jour Ubuntu sur Oracle Cloud..."
sudo apt update && sudo apt upgrade -y

# 2. Installation Node.js 20 LTS
echo "📦 Installation Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Installation des outils
echo "🔧 Installation des outils..."
sudo apt install -y git nginx ufw htop curl wget

# 4. Configuration firewall Oracle (iptables + Security Lists)
echo "🔥 Configuration firewall Oracle Cloud..."

# UFW local
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 53/udp    # DNS Smart Proxy
sudo ufw allow 3000/tcp  # Next.js dev
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# Note: Les Security Lists Oracle doivent être configurées dans le dashboard
echo "⚠️  IMPORTANT: Configurez les Security Lists Oracle :"
echo "   - Port 53/UDP (DNS)"
echo "   - Port 3000/TCP (Web)"
echo "   - Port 80/TCP (HTTP)"
echo "   - Port 443/TCP (HTTPS)"

# 5. Optimisation Oracle Cloud Free
echo "⚡ Optimisation pour Oracle Free Tier..."

# Swap pour les 6GB RAM
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimisation mémoire
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
echo "vm.vfs_cache_pressure=50" | sudo tee -a /etc/sysctl.conf

# 6. Clone du projet
if [ ! -d "/opt/lobbydezinzin" ]; then
  echo "📥 Clonage du projet..."
  sudo git clone https://github.com/votre-username/lobbydezinzin.git /opt/lobbydezinzin
  sudo chown -R $USER:$USER /opt/lobbydezinzin
  cd /opt/lobbydezinzin
else
  echo "📁 Mise à jour du projet..."
  cd /opt/lobbydezinzin
  git pull
fi

# 7. Installation dépendances
echo "📦 Installation des dépendances npm..."
npm install

# 8. Configuration environnement Oracle
echo "⚙️ Configuration .env pour Oracle Cloud..."
cat > .env << EOF
# Base de données (SQLite pour le free tier)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://$ORACLE_PUBLIC_IP:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Smart DNS Oracle
SMART_DNS_IP="$ORACLE_PUBLIC_IP"
SMART_DNS_PORT="53"

# Oracle Cloud specific
ORACLE_REGION="eu-frankfurt-1"
ORACLE_COMPARTMENT_ID="your-compartment-id"
EOF

# 9. Setup base de données SQLite (pour Oracle Free)
echo "🗄️ Configuration base de données SQLite..."
npx prisma generate
npx prisma db push

# 10. Build Next.js
echo "🏗️ Build de l'application..."
npm run build

# 11. Services systemd pour Oracle
echo "⚙️ Configuration des services Oracle Cloud..."

# Service Smart DNS
sudo tee /etc/systemd/system/smart-dns-oracle.service > /dev/null << EOF
[Unit]
Description=LobbyDeZinzin Smart DNS (Oracle Cloud)
After=network.target
StartLimitInterval=0

[Service]
Type=simple
User=root
WorkingDirectory=/opt/lobbydezinzin
ExecStart=/usr/bin/node scripts/smart-dns-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=ORACLE_FREE=true

# Oracle Cloud optimizations
LimitNOFILE=65536
OOMScoreAdjust=-100

[Install]
WantedBy=multi-user.target
EOF

# Service Next.js
sudo tee /etc/systemd/system/lobbydezinzin-oracle.service > /dev/null << EOF
[Unit]
Description=LobbyDeZinzin Web (Oracle Cloud)
After=network.target
StartLimitInterval=0

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/lobbydezinzin
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

# Oracle optimizations
LimitNOFILE=65536
MemoryAccounting=true
MemoryLimit=4G

[Install]
WantedBy=multi-user.target
EOF

# 12. Nginx pour Oracle
echo "🌐 Configuration Nginx Oracle Cloud..."
sudo tee /etc/nginx/sites-available/lobbydezinzin > /dev/null << EOF
server {
    listen 80;
    server_name $ORACLE_PUBLIC_IP;

    # Optimisations Oracle Free
    client_max_body_size 10M;
    keepalive_timeout 65;
    
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
        
        # Timeout optimisations
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/lobbydezinzin /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 13. Création du compte admin
echo "👤 Création du compte administrateur..."
npm run create-admin

# 14. Démarrage des services
echo "🚀 Démarrage des services Oracle..."
sudo systemctl daemon-reload
sudo systemctl enable smart-dns-oracle lobbydezinzin-oracle nginx
sudo systemctl start smart-dns-oracle lobbydezinzin-oracle nginx

# 15. Monitoring Oracle Free
echo "📊 Configuration monitoring Oracle Free..."
sudo tee /opt/monitor-oracle.sh > /dev/null << 'EOF'
#!/bin/bash
echo "=== Oracle Cloud Free Monitoring ==="
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "RAM Usage: $(free -h | awk 'NR==2{printf "%.1f%%\n", $3*100/$2}')"
echo "Disk Usage: $(df -h / | awk 'NR==2{print $5}')"
echo "Smart DNS: $(systemctl is-active smart-dns-oracle)"
echo "Web App: $(systemctl is-active lobbydezinzin-oracle)"
echo "Nginx: $(systemctl is-active nginx)"
echo "==================================="
EOF

sudo chmod +x /opt/monitor-oracle.sh
echo "0 */6 * * * /opt/monitor-oracle.sh >> /var/log/oracle-monitor.log" | sudo crontab -

# 16. Tests finaux
echo "🧪 Tests de validation..."
sleep 10

# Test DNS
if dig @$ORACLE_PUBLIC_IP google.com +short > /dev/null 2>&1; then
    echo "✅ Smart DNS fonctionne"
else
    echo "❌ Problème Smart DNS"
fi

# Test Web
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application web fonctionne"
else
    echo "❌ Problème application web"
fi

# 17. Instructions finales Oracle
echo ""
echo "🎉 DÉPLOIEMENT ORACLE CLOUD TERMINÉ !"
echo "====================================="
echo ""
echo "🔧 CONFIGURATION CONSOLE/PC:"
echo "   DNS Primaire: $ORACLE_PUBLIC_IP"
echo "   DNS Secondaire: 8.8.8.8"
echo ""
echo "🌐 ACCÈS WEB:"
echo "   http://$ORACLE_PUBLIC_IP:3000"
echo "   Admin: http://$ORACLE_PUBLIC_IP:3000/admin"
echo ""
echo "📱 COMPTES PAR DÉFAUT:"
echo "   Admin: admin@lobbydezinzin.com / Admin123!"
echo "   Test: test@lobbydezinzin.com / Test123!"
echo ""
echo "🔐 ORACLE CLOUD SECURITY LISTS:"
echo "   ⚠️  Configurez dans le dashboard Oracle :"
echo "   - Ingress 0.0.0.0/0 → Port 53/UDP (DNS)"
echo "   - Ingress 0.0.0.0/0 → Port 3000/TCP (Web)"
echo "   - Ingress 0.0.0.0/0 → Port 80/TCP (HTTP)"
echo ""
echo "📊 MONITORING:"
echo "   /opt/monitor-oracle.sh"
echo "   tail -f /var/log/oracle-monitor.log"
echo ""
echo "🎮 PROCHAINES ÉTAPES:"
echo "   1. Configurez les Security Lists Oracle"
echo "   2. Connectez-vous et ajoutez vos IPs autorisées"
echo "   3. Testez depuis votre console avec DNS: $ORACLE_PUBLIC_IP"
echo "   4. Changez de région via le site web"
echo "   5. Profitez des lobbies faciles ! 🚀"
echo ""
echo "💰 COÛT TOTAL: 0€/mois (Oracle Free Forever)"