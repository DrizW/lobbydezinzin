#!/bin/bash

# 🎯 LobbyDeZinzin - VPN Server Installation Script
# Installe WireGuard sur chaque VPS pour reproduire NolagVPN/LobbyGod

set -e

echo "🎯 Installation du serveur VPN LobbyDeZinzin..."
echo "📡 Configuration optimisée pour gaming..."

# 🔧 Variables de configuration
WG_PORT=51820
WG_INTERFACE=wg0
WG_SUBNET="10.7.0.0/24"
WG_SERVER_IP="10.7.0.1"
WG_CLIENT_IP="10.7.0.2"

# 🌍 Détection du pays (à configurer selon le VPS)
COUNTRY=${1:-"nigeria"}
echo "🌍 Configuration pour: $COUNTRY"

# 📦 Installation des dépendances
echo "📦 Installation des dépendances..."
apt update
apt install -y wireguard wireguard-tools iptables-persistent

# 🔑 Génération des clés
echo "🔑 Génération des clés WireGuard..."
wg genkey | tee /etc/wireguard/private.key | wg pubkey > /etc/wireguard/public.key
wg genkey | tee /etc/wireguard/client_private.key | wg pubkey > /etc/wireguard/client_public.key

PRIVATE_KEY=$(cat /etc/wireguard/private.key)
PUBLIC_KEY=$(cat /etc/wireguard/public.key)
CLIENT_PRIVATE_KEY=$(cat /etc/wireguard/client_private.key)
CLIENT_PUBLIC_KEY=$(cat /etc/wireguard/client_public.key)

# ⚙️ Configuration du serveur WireGuard
echo "⚙️ Configuration du serveur WireGuard..."
cat > /etc/wireguard/wg0.conf << EOF
[Interface]
Address = $WG_SERVER_IP/24
PrivateKey = $PRIVATE_KEY
ListenPort = $WG_PORT
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# 🎮 Optimisations gaming
MTU = 1420
PersistentKeepalive = 25

[Peer]
PublicKey = $CLIENT_PUBLIC_KEY
AllowedIPs = $WG_CLIENT_IP/32
EOF

# 🔒 Sécurisation des fichiers
chmod 600 /etc/wireguard/private.key
chmod 600 /etc/wireguard/client_private.key
chmod 600 /etc/wireguard/wg0.conf

# 🌐 Configuration du routage
echo "🌐 Configuration du routage..."
echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf
sysctl -p

# 🚀 Démarrage du service
echo "🚀 Démarrage du service WireGuard..."
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

# 📊 Vérification
echo "📊 Vérification de l'installation..."
systemctl status wg-quick@wg0 --no-pager -l

# 📝 Configuration client
echo "📝 Génération de la configuration client..."
cat > /root/lobbydezinzin-client.conf << EOF
# 🎯 LobbyDeZinzin - Configuration Client WireGuard
# Pays: $COUNTRY
# Date: $(date)

[Interface]
Address = $WG_CLIENT_IP/24
PrivateKey = $CLIENT_PRIVATE_KEY
DNS = 192.168.1.31

[Peer]
PublicKey = $PUBLIC_KEY
Endpoint = $(curl -s ifconfig.me):$WG_PORT
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
EOF

# 🔧 Configuration firewall
echo "🔧 Configuration du firewall..."
ufw allow $WG_PORT/udp
ufw allow ssh
ufw --force enable

# 📋 Informations de connexion
echo ""
echo "✅ Installation terminée !"
echo ""
echo "🌍 Pays configuré: $COUNTRY"
echo "🔑 Port WireGuard: $WG_PORT"
echo "📡 Interface: $WG_INTERFACE"
echo "🌐 Sous-réseau: $WG_SUBNET"
echo ""
echo "📁 Configuration client: /root/lobbydezinzin-client.conf"
echo "🔑 Clés générées dans: /etc/wireguard/"
echo ""
echo "🎮 Pour connecter un client:"
echo "1. Copier /root/lobbydezinzin-client.conf"
echo "2. Installer WireGuard sur le client"
echo "3. Importer la configuration"
echo "4. Se connecter au VPN"
echo ""
echo "📊 Statut du service:"
systemctl status wg-quick@wg0 --no-pager -l

echo ""
echo "🎯 Serveur VPN LobbyDeZinzin prêt !"
echo "🚀 Performance optimisée pour gaming !"
