#!/bin/bash

set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
DOMAIN="lobbydezinzin.com"
API_KEY="VOTRE_CLE_API_SECRETE"
POWERDNS_HOST="localhost"
POWERDNS_PORT="8081"


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

# Vérification des paramètres
if [ $# -ne 2 ]; then
    echo "Usage: $0 [PAYS] [IP_SERVEUR]"
    echo "Exemple: $0 nigeria 192.168.1.100"
    exit 1
fi

COUNTRY=$1
IP_SERVER=$2
ZONE="$COUNTRY.$DOMAIN"

log_info "🌍 Déploiement DNS pour $COUNTRY ($IP_SERVER)"

# Vérification de la connectivité PowerDNS
log_info "🔍 Vérification de la connectivité PowerDNS..."
if ! curl -s "http://$POWERDNS_HOST:$POWERDNS_PORT/api/v1/servers/localhost" > /dev/null; then
    log_error "Impossible de se connecter à PowerDNS sur $POWERDNS_HOST:$POWERDNS_PORT"
    exit 1
fi

# Création de la zone
log_info "📝 Création de la zone $ZONE..."
curl -s -X POST "http://$POWERDNS_HOST:$POWERDNS_PORT/api/v1/servers/localhost/zones" \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$ZONE\",
        \"kind\": \"Master\",
        \"masters\": [],
        \"nameservers\": []
    }"

if [ $? -eq 0 ]; then
    log_success "Zone $ZONE créée"
else
    log_error "Erreur lors de la création de la zone"
    exit 1
fi

# Ajout des enregistrements DNS
log_info "🔧 Ajout des enregistrements DNS..."

# Enregistrements de base
RECORDS=(
    "@ A $IP_SERVER"
    "www A $IP_SERVER"
    "ns1 A $IP_SERVER"
    "ns2 A $IP_SERVER"
)

# Enregistrements spécifiques pour Warzone
WARZONE_RECORDS=(
    "cod A $IP_SERVER"
    "warzone A $IP_SERVER"
    "matchmaking A $IP_SERVER"
    "lobby A $IP_SERVER"
    "sbmm A $IP_SERVER"
    "game A $IP_SERVER"
    "play A $IP_SERVER"
    "server A $IP_SERVER"
)

# Ajout des enregistrements de base
for record in "${RECORDS[@]}"; do
    name=$(echo $record | cut -d' ' -f1)
    type=$(echo $record | cut -d' ' -f2)
    value=$(echo $record | cut -d' ' -f3)
    
    log_info "Ajout: $name $type $value"
    
    curl -s -X PATCH "http://$POWERDNS_HOST:$POWERDNS_PORT/api/v1/servers/localhost/zones/$ZONE" \
        -H "X-API-Key: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"rrsets\": [{
                \"name\": \"$name.$ZONE\",
                \"type\": \"$type\",
                \"ttl\": 300,
                \"changetype\": \"REPLACE\",
                \"records\": [{
                    \"content\": \"$value\",
                    \"disabled\": false
                }]
            }]
        }"
    
    if [ $? -eq 0 ]; then
        log_success "Enregistrement $name.$ZONE ajouté"
    else
        log_warning "Erreur lors de l'ajout de $name.$ZONE"
    fi
done

# Ajout des enregistrements Warzone
for record in "${WARZONE_RECORDS[@]}"; do
    name=$(echo $record | cut -d' ' -f1)
    type=$(echo $record | cut -d' ' -f2)
    value=$(echo $record | cut -d' ' -f3)
    
    log_info "Ajout Warzone: $name $type $value"
    
    curl -s -X PATCH "http://$POWERDNS_HOST:$POWERDNS_PORT/api/v1/servers/localhost/zones/$ZONE" \
        -H "X-API-Key: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"rrsets\": [{
                \"name\": \"$name.$ZONE\",
                \"type\": \"$type\",
                \"ttl\": 300,
                \"changetype\": \"REPLACE\",
                \"records\": [{
                    \"content\": \"$value\",
                    \"disabled\": false
                }]
            }]
        }"
    
    if [ $? -eq 0 ]; then
        log_success "Enregistrement Warzone $name.$ZONE ajouté"
    else
        log_warning "Erreur lors de l'ajout de $name.$ZONE"
    fi
done

# Test de résolution DNS
log_info "🧪 Test de résolution DNS..."
sleep 2

if nslookup "$ZONE" > /dev/null 2>&1; then
    log_success "✅ Résolution DNS fonctionnelle pour $ZONE"
else
    log_warning "⚠️  La résolution DNS peut prendre quelques minutes"
fi

# Mise à jour de la base de données de l'application
log_info "💾 Mise à jour de la base de données..."

# Génération du script SQL
cat > /tmp/update_country.sql << EOF
UPDATE "Country" 
SET "dnsPrimary" = '$IP_SERVER', 
    "dnsSecondary" = '$IP_SERVER',
    "updatedAt" = NOW()
WHERE "name" = '$COUNTRY';
EOF

# Exécution du script SQL (si psql est disponible)
if command -v psql &> /dev/null; then
    if psql -h localhost -U postgres -d lobbydezinzin -f /tmp/update_country.sql; then
        log_success "Base de données mise à jour"
    else
        log_warning "Impossible de mettre à jour la base de données"
    fi
else
    log_warning "PostgreSQL non trouvé, mise à jour manuelle requise"
fi

# Nettoyage
rm -f /tmp/update_country.sql

log_success "🎉 Déploiement DNS terminé pour $COUNTRY"
log_info "📋 Résumé:"
echo "   - Zone: $ZONE"
echo "   - IP: $IP_SERVER"
echo "   - Enregistrements: ${#RECORDS[@]} de base + ${#WARZONE_RECORDS[@]} Warzone"
echo ""
log_info "🔧 Prochaines étapes:"
echo "   1. Tester la résolution: nslookup $ZONE"
echo "   2. Configurer le client avec DNS: $IP_SERVER"
echo "   3. Tester Warzone avec les nouveaux DNS" 