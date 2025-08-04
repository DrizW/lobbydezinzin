#!/bin/bash

# Script de déploiement Smart DNS pour LobbyDeZinzin
# Ce script configure le serveur DNS intelligent sur Ubuntu/Debian

set -e

echo "🚀 Déploiement Smart DNS LobbyDeZinzin"
echo "=====================================⁣⁣⁣"

# Vérifier les privilèges root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Ce script doit être exécuté en tant que root (sudo)"
  exit 1
fi

# Variables de configuration
DOMAIN_NAME=${1:-"lobbydezinzin.com"}
VPS_IP=${2:-$(curl -s ifconfig.me)}
DNS_PORT=53
WEB_PORT=3000

echo "🔧 Configuration:"
echo "   - Domaine: $DOMAIN_NAME"
echo "   - IP VPS: $VPS_IP"
echo "   - Port DNS: $DNS_PORT"
echo "   - Port Web: $WEB_PORT"
echo ""

# 1. Mise à jour du système
echo "📦 Mise à jour du système..."
apt update && apt upgrade -y

# 2. Installation Node.js et npm
echo "📦 Installation Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Installation des dépendances système
echo "📦 Installation des dépendances..."
apt install -y git nginx ufw fail2ban htop

# 4. Configuration du firewall
echo "🔥 Configuration du firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow $DNS_PORT/udp  # DNS
ufw allow $WEB_PORT/tcp  # Next.js
ufw allow 80/tcp         # HTTP
ufw allow 443/tcp        # HTTPS
ufw --force enable

# 5. Clonage du projet (si nécessaire)
if [ ! -d "/opt/lobbydezinzin" ]; then
  echo "📥 Clonage du projet..."
  git clone https://github.com/votre-repo/lobbydezinzin.git /opt/lobbydezinzin
  cd /opt/lobbydezinzin
else
  echo "📁 Projet déjà présent, mise à jour..."
  cd /opt/lobbydezinzin
  git pull
fi

# 6. Installation des dépendances npm
echo "📦 Installation des dépendances npm..."
npm install
npm install -g pm2

# 7. Configuration de l'environnement
echo "⚙️ Configuration de l'environnement..."
if [ ! -f ".env" ]; then
  cat > .env << EOF
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/lobbydezinzin"

# NextAuth
NEXTAUTH_URL="http://$VPS_IP:$WEB_PORT"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Smart DNS
SMART_DNS_IP="$VPS_IP"
SMART_DNS_PORT="$DNS_PORT"
EOF
  echo "✅ Fichier .env créé"
else
  echo "✅ Fichier .env existant"
fi

# 8. Build du projet Next.js
echo "🏗️ Build du projet Next.js..."
npm run build

# 9. Création du service systemd pour Smart DNS
echo "⚙️ Configuration du service Smart DNS..."
cat > /etc/systemd/system/smart-dns.service << EOF
[Unit]
Description=LobbyDeZinzin Smart DNS Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/lobbydezinzin
ExecStart=/usr/bin/node scripts/smart-dns-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 10. Création du service systemd pour Next.js
echo "⚙️ Configuration du service Next.js..."
cat > /etc/systemd/system/lobbydezinzin-web.service << EOF
[Unit]
Description=LobbyDeZinzin Web Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/lobbydezinzin
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=$WEB_PORT

[Install]
WantedBy=multi-user.target
EOF

# 11. Configuration Nginx
echo "🌐 Configuration Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:$WEB_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Activer le site
ln -sf /etc/nginx/sites-available/$DOMAIN_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 12. Démarrage des services
echo "🚀 Démarrage des services..."
systemctl daemon-reload
systemctl enable smart-dns lobbydezinzin-web nginx
systemctl start smart-dns lobbydezinzin-web nginx

# 13. Vérification des services
echo "🔍 Vérification des services..."
sleep 5

if systemctl is-active --quiet smart-dns; then
    echo "✅ Smart DNS Server: ACTIF"
else
    echo "❌ Smart DNS Server: ERREUR"
    systemctl status smart-dns --no-pager
fi

if systemctl is-active --quiet lobbydezinzin-web; then
    echo "✅ Application Web: ACTIVE"
else
    echo "❌ Application Web: ERREUR"
    systemctl status lobbydezinzin-web --no-pager
fi

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: ACTIF"
else
    echo "❌ Nginx: ERREUR"
    systemctl status nginx --no-pager
fi

# 14. Test DNS
echo "🧪 Test du serveur DNS..."
if command -v dig &> /dev/null; then
    if dig @$VPS_IP google.com +short > /dev/null 2>&1; then
        echo "✅ Serveur DNS répond correctement"
    else
        echo "❌ Erreur test DNS"
    fi
else
    echo "⚠️ 'dig' non installé, test DNS ignoré"
fi

# 15. Instructions finales
echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "======================="
echo ""
echo "🔧 CONFIGURATION CONSOLE/PC:"
echo "   DNS Primaire: $VPS_IP"
echo "   DNS Secondaire: 8.8.8.8"
echo ""
echo "🌐 ACCÈS WEB:"
echo "   URL: http://$VPS_IP:$WEB_PORT"
echo "   Admin: http://$VPS_IP:$WEB_PORT/admin"
echo ""
echo "📊 GESTION SERVICES:"
echo "   systemctl status smart-dns"
echo "   systemctl status lobbydezinzin-web"
echo "   systemctl restart smart-dns"
echo ""
echo "📋 LOGS:"
echo "   journalctl -u smart-dns -f"
echo "   journalctl -u lobbydezinzin-web -f"
echo ""
echo "🎮 PROCHAINES ÉTAPES:"
echo "   1. Configurez votre base de données PostgreSQL"
echo "   2. Exécutez: npm run create-admin"
echo "   3. Connectez-vous et ajoutez les IPs autorisées"
echo "   4. Configurez DNS sur votre console: $VPS_IP"
echo "   5. Testez Warzone avec différentes régions !"
echo ""
echo "🌍 Smart DNS déployé avec succès sur $VPS_IP:$DNS_PORT"