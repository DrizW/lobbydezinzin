#!/bin/bash

set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
PROJECT_NAME="lobbydezinzin-dns"
DOMAIN="lobbydezinzin.com"
API_KEY=$(openssl rand -hex 32)


log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}


check_prerequisites() {
    log_info "🔍 Vérification des prérequis..."
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    # Vérifier les ports disponibles
    if netstat -tuln | grep -q ":53 "; then
        log_warning "Le port 53 est déjà utilisé"
        read -p "Continuer quand même ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log_success "Prérequis vérifiés"
}

# Création des dossiers de configuration
create_config_dirs() {
    log_info "📁 Création des dossiers de configuration..."
    
    mkdir -p config
    mkdir -p logs
    mkdir -p config/ssl
    
    log_success "Dossiers créés"
}

# Génération de la configuration PowerDNS
generate_pdns_config() {
    log_info "⚙️  Génération de la configuration PowerDNS..."
    
    cat > config/pdns.conf << EOF
# Configuration PowerDNS pour LobbyDeZinzin
launch=mysql
mysql-host=db
mysql-user=pdns
mysql-password=pdns123
mysql-dbname=pdns

# API et interface web
api=yes
api-key=$API_KEY
webserver=yes
webserver-address=0.0.0.0
webserver-port=8081
webserver-allow-from=0.0.0.0/0

# Configuration générale
master=yes
default-ttl=300
default-soa-edit=INCEPTION-INCREMENT
default-soa-edit-signed=INCEPTION-INCREMENT

# Logging
loglevel=4
log-dns-queries=yes
log-dns-details=yes

# Sécurité
allow-axfr-ips=127.0.0.1
allow-notify-from=127.0.0.1
EOF
    
    log_success "Configuration PowerDNS générée"
}

# Génération de la configuration Nginx
generate_nginx_config() {
    log_info "⚙️  Génération de la configuration Nginx..."
    
    cat > config/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream powerdns_admin {
        server powerdns-admin:80;
    }
    
    upstream powerdns_api {
        server powerdns:8081;
    }
    
    server {
        listen 80;
        server_name $DOMAIN;
        
        # Redirection vers HTTPS
        return 301 https://\$server_name\$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name $DOMAIN;
        
        # Configuration SSL (à remplacer par vos certificats)
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        
        # Interface d'administration PowerDNS
        location /admin {
            proxy_pass http://powerdns_admin;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # API PowerDNS
        location /api {
            proxy_pass http://powerdns_api;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Page d'accueil
        location / {
            return 200 "LobbyDeZinzin DNS - Service actif";
            add_header Content-Type text/plain;
        }
    }
}
EOF
    
    log_success "Configuration Nginx générée"
}

# Génération des certificats SSL auto-signés
generate_ssl_certs() {
    log_info "🔐 Génération des certificats SSL..."
    
    # Générer une clé privée
    openssl genrsa -out config/ssl/key.pem 2048
    
    # Générer un certificat auto-signé
    openssl req -new -x509 -key config/ssl/key.pem -out config/ssl/cert.pem -days 365 -subj "/C=FR/ST=France/L=Paris/O=LobbyDeZinzin/CN=$DOMAIN"
    
    log_success "Certificats SSL générés"
}

# Mise à jour du docker-compose.yml
update_docker_compose() {
    log_info "🐳 Mise à jour du docker-compose.yml..."
    
    # Remplacer la clé API dans le fichier docker-compose.yml
    sed -i "s/VOTRE_CLE_API_SECRETE/$API_KEY/g" docker-compose.yml
    
    log_success "Docker Compose mis à jour"
}

# Déploiement des conteneurs
deploy_containers() {
    log_info "🚀 Déploiement des conteneurs..."
    
    # Arrêter les conteneurs existants
    docker-compose down 2>/dev/null || true
    
    # Construire et démarrer les conteneurs
    docker-compose up -d
    
    # Attendre que les services soient prêts
    log_info "⏳ Attente du démarrage des services..."
    sleep 30
    
    log_success "Conteneurs déployés"
}

# Initialisation des zones DNS
initialize_dns_zones() {
    log_info "🌍 Initialisation des zones DNS..."
    
    # Attendre que PowerDNS soit prêt
    until docker-compose exec powerdns pdnsutil list-all-zones > /dev/null 2>&1; do
        log_info "⏳ Attente de PowerDNS..."
        sleep 5
    done
    
    # Créer les zones pour chaque pays
    countries=("nigeria" "taiwan" "israel" "thailand" "cambodia" "morocco" "algeria" "tunisia" "kenya")
    
    for country in "${countries[@]}"; do
        log_info "Création de la zone $country.$DOMAIN..."
        
        # Créer la zone
        docker-compose exec powerdns pdnsutil create-zone "$country.$DOMAIN"
        
        # Ajouter les enregistrements de base
        docker-compose exec powerdns pdnsutil add-record "$country.$DOMAIN" @ A 127.0.0.1
        docker-compose exec powerdns pdnsutil add-record "$country.$DOMAIN" www A 127.0.0.1
        
        # Ajouter les enregistrements Warzone
        docker-compose exec powerdns pdnsutil add-record "$country.$DOMAIN" cod A 127.0.0.1
        docker-compose exec powerdns pdnsutil add-record "$country.$DOMAIN" warzone A 127.0.0.1
        docker-compose exec powerdns pdnsutil add-record "$country.$DOMAIN" matchmaking A 127.0.0.1
        docker-compose exec powerdns pdnsutil add-record "$country.$DOMAIN" lobby A 127.0.0.1
        docker-compose exec powerdns pdnsutil add-record "$country.$DOMAIN" sbmm A 127.0.0.1
        
        log_success "Zone $country.$DOMAIN créée"
    done
    
    log_success "Zones DNS initialisées"
}

# Test de fonctionnement
test_deployment() {
    log_info "🧪 Test du déploiement..."
    
    # Test de résolution DNS
    if nslookup "nigeria.$DOMAIN" 127.0.0.1 > /dev/null 2>&1; then
        log_success "Résolution DNS fonctionnelle"
    else
        log_warning "Résolution DNS non fonctionnelle (normal au début)"
    fi
    
    # Test de l'API PowerDNS
    if curl -s "http://localhost:8081/api/v1/servers/localhost" > /dev/null; then
        log_success "API PowerDNS accessible"
    else
        log_warning "API PowerDNS non accessible"
    fi
    
    # Test de l'interface d'administration
    if curl -s "http://localhost:8080" > /dev/null; then
        log_success "Interface d'administration accessible"
    else
        log_warning "Interface d'administration non accessible"
    fi
}

# Affichage des informations de connexion
show_connection_info() {
    echo ""
    echo "=========================================="
    echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
    echo "=========================================="
    echo ""
    echo "📋 Informations de connexion :"
    echo "   - Interface d'administration : http://localhost:8080"
    echo "   - API PowerDNS : http://localhost:8081"
    echo "   - Clé API : $API_KEY"
    echo ""
    echo "🌍 Zones DNS créées :"
    for country in nigeria taiwan israel thailand cambodia morocco algeria tunisia kenya; do
        echo "   - $country.$DOMAIN"
    done
    echo ""
    echo "🔧 Commandes utiles :"
    echo "   - Voir les logs : docker-compose logs -f"
    echo "   - Arrêter : docker-compose down"
    echo "   - Redémarrer : docker-compose restart"
    echo "   - Monitoring : ./scripts/monitor-dns.sh"
    echo ""
    echo "⚠️  IMPORTANT :"
    echo "   - Remplacez les IPs 127.0.0.1 par vos vraies IPs de serveurs"
    echo "   - Configurez vos certificats SSL pour la production"
    echo "   - Changez les mots de passe par défaut"
    echo ""
}

# Fonction principale
main() {
    echo "🚀 Déploiement rapide DNS LobbyDeZinzin"
    echo "======================================"
    echo ""
    
    check_prerequisites
    create_config_dirs
    generate_pdns_config
    generate_nginx_config
    generate_ssl_certs
    update_docker_compose
    deploy_containers
    initialize_dns_zones
    test_deployment
    show_connection_info
    
    log_success "Déploiement terminé !"
}

# Gestion des erreurs
trap 'log_error "Erreur lors du déploiement. Arrêt."; exit 1' ERR

# Exécution
main "$@" 