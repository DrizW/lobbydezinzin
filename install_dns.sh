#!/bin/bash

# Script d'installation du système DNS Smart pour LobbyDeZinzin
# Compatible avec Warzone SBMM bypass

set -e

echo '🚀 Installation du système DNS Smart...'

# Mise à jour du système
apt update && apt upgrade -y

# Installation de BIND9 et outils
apt install -y bind9 bind9utils dnsutils

# Arrêt du service pour configuration
systemctl stop bind9

# Configuration BIND9
cat > /etc/bind/named.conf.options << 'EOF'
options {
    directory \
/var/cache/bind\;
    
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
    version \DNS
Server\;
    hostname \lobbydezinzin-dns\;
};

// Zone pour la géolocalisation Warzone
zone \lobbydezinzin.com\ {
    type master;
    file \/etc/bind/zones/lobbydezinzin.com.zone\;
    allow-transfer { none; };
    allow-update { 127.0.0.1; };
};

// Zones pour les domaines de géolocalisation
zone \demonware.net\ {
    type master;
    file \/etc/bind/zones/demonware.net.zone\;
    allow-transfer { none; };
    allow-update { 127.0.0.1; };
};

zone \activision.com\ {
    type master;
    file \/etc/bind/zones/activision.com.zone\;
    allow-transfer { none; };
    allow-update { 127.0.0.1; };
};

zone \callofduty.com\ {
    type master;
    file \/etc/bind/zones/callofduty.com.zone\;
    allow-transfer { none; };
    allow-update { 127.0.0.1; };
};

logging {
    channel default_log {
        file \/var/log/bind/query.log\ versions 3 size 5m;
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
\ 300
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
\ 300
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
\ 300
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
\ 300
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

# Créer le dossier de logs
mkdir -p /var/log/bind
chown bind:bind /var/log/bind

# Vérifier la configuration
named-checkconf /etc/bind/named.conf.options
named-checkzone lobbydezinzin.com /etc/bind/zones/lobbydezinzin.com.zone
named-checkzone demonware.net /etc/bind/zones/demonware.net.zone
named-checkzone activision.com /etc/bind/zones/activision.com.zone
named-checkzone callofduty.com /etc/bind/zones/callofduty.com.zone

# Démarrer BIND9
systemctl enable bind9
systemctl start bind9

# Vérifier le statut
systemctl status bind9

echo '✅ BIND9 installé et configuré !'
echo '🌍 DNS Server: 139.84.240.209'
echo '📝 Zones configurées: lobbydezinzin.com, demonware.net, activision.com, callofduty.com'

