#!/bin/bash

# Script d'installation complet du système DNS Smart pour LobbyDeZinzin
# Compatible avec Warzone SBMM bypass

set -e

echo "🚀 Installation du système DNS Smart complet..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si on est root
if [[ $EUID -ne 0 ]]; then
   log_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

# Mise à jour du système
log_info "Mise à jour du système..."
apt update && apt upgrade -y

# Installation des dépendances
log_info "Installation des dépendances..."
apt install -y bind9 bind9utils dnsutils python3 python3-pip python3-venv

# Installation des dépendances Python
log_info "Installation des dépendances Python..."
pip3 install flask flask-cors

# Arrêt du service pour configuration
systemctl stop bind9

# Configuration BIND9
log_info "Configuration de BIND9..."

cat > /etc/bind/named.conf.options << 'EOF'
options {
    directory "/var/cache/bind";
    
    // Écouter sur toutes les interfaces
    listen-on { any; };
    listen-on-v6 { any; };
    
    // Autoriser les requêtes depuis n'importe où
    allow-query { any; };
    allow-recursion { any; };
    
    // Forwarders vers DNS publics
    forwarders {
        8.8.8.8;
        8.8.4.4;
        1.1.1.1;
    };
    
    // Options de performance
    max-cache-size 256M;
    max-cache-ttl 3600;
    
    // Logs détaillés
    version "DNS Server";
    hostname "lobbydezinzin-dns";
};

// Zone pour la géolocalisation Warzone
zone "lobbydezinzin.com" {
    type master;
    file "/etc/bind/zones/lobbydezinzin.com.zone";
    allow-transfer { none; };
    allow-update { 127.0.0.1; };
};

// Zones pour les domaines de géolocalisation
zone "demonware.net" {
    type master;
    file "/etc/bind/zones/demonware.net.zone";
    allow-transfer { none; };
    allow-update { 127.0.0.1; };
};

zone "activision.com" {
    type master;
    file "/etc/bind/zones/activision.com.zone";
    allow-transfer { none; };
    allow-update { 127.0.0.1; };
};

zone "callofduty.com" {
    type master;
    file "/etc/bind/zones/callofduty.com.zone";
    allow-transfer { none; };
    allow-update { 127.0.0.1; };
};

logging {
    channel default_log {
        file "/var/log/bind/query.log" versions 3 size 5m;
        severity info;
        print-time yes;
        print-severity yes;
        print-category yes;
    };
    
    category default { default_log; };
    category queries { default_log; };
    category security { default_log; };
};
EOF

# Créer le dossier des zones
mkdir -p /etc/bind/zones

# Zone principale lobbydezinzin.com
cat > /etc/bind/zones/lobbydezinzin.com.zone << 'EOF'
$TTL 300
@       IN      SOA     lobbydezinzin.com. admin.lobbydezinzin.com. (
                        2024010101      ; Serial
                        300             ; Refresh
                        300             ; Retry
                        300             ; Expire
                        300             ; Minimum TTL
)

@       IN      NS      ns1.lobbydezinzin.com.
@       IN      A       139.84.240.209
ns1     IN      A       139.84.240.209

; API pour changement de région
api     IN      A       139.84.240.209
dns     IN      A       139.84.240.209
smart   IN      A       139.84.240.209
EOF

# Zone demonware.net (géolocalisation Warzone)
cat > /etc/bind/zones/demonware.net.zone << 'EOF'
$TTL 300
@       IN      SOA     demonware.net. admin.lobbydezinzin.com. (
                        2024010101      ; Serial
                        300             ; Refresh
                        300             ; Retry
                        300             ; Expire
                        300             ; Minimum TTL
)

@       IN      NS      ns1.lobbydezinzin.com.
@       IN      A       139.84.240.209

; Domaines de géolocalisation Warzone
*.demonware.net.    IN      A       139.84.240.209
geo.demonware.net.  IN      A       139.84.240.209
match.demonware.net. IN     A       139.84.240.209
EOF

# Zone activision.com
cat > /etc/bind/zones/activision.com.zone << 'EOF'
$TTL 300
@       IN      SOA     activision.com. admin.lobbydezinzin.com. (
                        2024010101      ; Serial
                        300             ; Refresh
                        300             ; Retry
                        300             ; Expire
                        300             ; Minimum TTL
)

@       IN      NS      ns1.lobbydezinzin.com.
@       IN      A       139.84.240.209

; Domaines Activision
*.activision.com.   IN      A       139.84.240.209
geo.activision.com. IN      A       139.84.240.209
EOF

# Zone callofduty.com
cat > /etc/bind/zones/callofduty.com.zone << 'EOF'
$TTL 300
@       IN      SOA     callofduty.com. admin.lobbydezinzin.com. (
                        2024010101      ; Serial
                        300             ; Refresh
                        300             ; Retry
                        300             ; Expire
                        300             ; Minimum TTL
)

@       IN      NS      ns1.lobbydezinzin.com.
@       IN      A       139.84.240.209

; Domaines Call of Duty
*.callofduty.com.   IN      A       139.84.240.209
geo.callofduty.com. IN      A       139.84.240.209
EOF

# Créer les dossiers de logs et données
mkdir -p /var/log/bind
mkdir -p /var/log/lobbydezinzin
mkdir -p /var/lib/lobbydezinzin
chown bind:bind /var/log/bind
chown bind:bind /var/log/lobbydezinzin

# Vérifier la configuration
log_info "Vérification de la configuration BIND9..."
named-checkconf /etc/bind/named.conf.options
named-checkzone lobbydezinzin.com /etc/bind/zones/lobbydezinzin.com.zone
named-checkzone demonware.net /etc/bind/zones/demonware.net.zone
named-checkzone activision.com /etc/bind/zones/activision.com.zone
named-checkzone callofduty.com /etc/bind/zones/callofduty.com.zone

# Démarrer BIND9
log_info "Démarrage de BIND9..."
systemctl enable bind9
systemctl start bind9

# Vérifier le statut
if systemctl is-active --quiet bind9; then
    log_success "BIND9 démarré avec succès"
else
    log_error "Erreur lors du démarrage de BIND9"
    systemctl status bind9
    exit 1
fi

# Copier l'API DNS
log_info "Installation de l'API DNS..."
cp dns_api.py /opt/lobbydezinzin/
chmod +x /opt/lobbydezinzin/dns_api.py

# Installer le service systemd
log_info "Installation du service systemd..."
cp dns-api.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable dns-api
systemctl start dns-api

# Vérifier le statut de l'API
if systemctl is-active --quiet dns-api; then
    log_success "API DNS démarrée avec succès"
else
    log_error "Erreur lors du démarrage de l'API DNS"
    systemctl status dns-api
    exit 1
fi

# Configuration du firewall
log_info "Configuration du firewall..."
ufw allow 53/tcp
ufw allow 53/udp
ufw allow 5001/tcp

# Test de fonctionnement
log_info "Test de fonctionnement..."
sleep 2

# Test DNS
if dig @127.0.0.1 lobbydezinzin.com; then
    log_success "Test DNS réussi"
else
    log_warning "Test DNS échoué"
fi

# Test API
if curl -s http://localhost:5001/api/dns/status | grep -q "success"; then
    log_success "Test API réussi"
else
    log_warning "Test API échoué"
fi

# Informations finales
echo ""
log_success "Installation terminée avec succès !"
echo ""
echo "🌍 Configuration DNS Smart :"
echo "   • Serveur DNS: 139.84.240.209"
echo "   • Port DNS: 53 (TCP/UDP)"
echo "   • API DNS: http://139.84.240.209:5001"
echo ""
echo "📝 Zones configurées :"
echo "   • lobbydezinzin.com"
echo "   • demonware.net (Warzone)"
echo "   • activision.com (Warzone)"
echo "   • callofduty.com (Warzone)"
echo ""
echo "🔧 Endpoints API disponibles :"
echo "   • GET  /api/dns/status - Statut du serveur"
echo "   • POST /api/dns/change-region - Changer de région"
echo "   • GET  /api/dns/current-region - Région actuelle"
echo "   • GET  /api/dns/logs - Logs DNS"
echo ""
echo "🎮 Régions disponibles :"
echo "   • johannesburg (Johannesburg, South Africa)"
echo "   • london (London, UK)"
echo "   • frankfurt (Frankfurt, Germany)"
echo "   • newyork (New York, USA)"
echo "   • tokyo (Tokyo, Japan)"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Configurer votre console/PC pour utiliser 139.84.240.209 comme DNS"
echo "   2. Tester le changement de région via l'API"
echo "   3. Vérifier que Warzone détecte la nouvelle zone géographique"
echo ""
echo "📊 Monitoring :"
echo "   • Logs BIND9: /var/log/bind/query.log"
echo "   • Logs API: /var/log/lobbydezinzin/dns_api.log"
echo "   • Statut BIND9: systemctl status bind9"
echo "   • Statut API: systemctl status dns-api"
echo ""
