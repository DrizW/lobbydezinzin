#!/bin/bash

set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
DOMAIN="lobbydezinzin.com"
COUNTRIES=("nigeria" "taiwan" "israel" "thailand" "cambodia" "morocco" "algeria" "tunisia" "kenya")
LOG_FILE="/var/log/dns-monitor.log"
ALERT_EMAIL="admin@lobbydezinzin.com"


log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - INFO: $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - SUCCESS: $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - WARNING: $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1" >> "$LOG_FILE"
}

# Fonction d'envoi d'alerte
send_alert() {
    local country=$1
    local error=$2
    
    if command -v mail &> /dev/null; then
        echo "DNS Error for $country: $error" | mail -s "DNS Alert - $country" "$ALERT_EMAIL"
    fi
    
    log_error "Alerte envoyée pour $country: $error"
}

# Fonction de test DNS
test_dns_resolution() {
    local country=$1
    local zone="$country.$DOMAIN"
    local timeout=10
    
    # Test de résolution de base
    if timeout $timeout nslookup "$zone" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Fonction de test de connectivité
test_connectivity() {
    local country=$1
    local zone="$country.$DOMAIN"
    local timeout=5
    
    # Récupérer l'IP du serveur DNS
    local dns_ip=$(nslookup "$zone" 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    
    if [ -z "$dns_ip" ]; then
        return 1
    fi
    
    # Test de connectivité TCP sur le port 53
    if timeout $timeout bash -c "</dev/tcp/$dns_ip/53" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Fonction de test de latence
test_latency() {
    local country=$1
    local zone="$country.$DOMAIN"
    local timeout=5
    
    # Mesurer le temps de résolution DNS
    local start_time=$(date +%s%N)
    
    if nslookup "$zone" > /dev/null 2>&1; then
        local end_time=$(date +%s%N)
        local latency=$(( (end_time - start_time) / 1000000 ))  # en millisecondes
        echo $latency
    else
        echo "timeout"
    fi
}

# Fonction de vérification des enregistrements Warzone
test_warzone_records() {
    local country=$1
    local zone="$country.$DOMAIN"
    local warzone_records=("cod" "warzone" "matchmaking" "lobby" "sbmm")
    local failed_records=()
    
    for record in "${warzone_records[@]}"; do
        if ! nslookup "$record.$zone" > /dev/null 2>&1; then
            failed_records+=("$record")
        fi
    done
    
    if [ ${#failed_records[@]} -eq 0 ]; then
        return 0
    else
        echo "${failed_records[*]}"
        return 1
    fi
}

# Fonction principale de monitoring
main() {
    log_info "🔍 Début du monitoring DNS"
    
    local total_countries=${#COUNTRIES[@]}
    local healthy_countries=0
    local warning_countries=0
    local error_countries=0
    
    echo "=========================================="
    echo "🌍 Monitoring DNS - LobbyDeZinzin"
    echo "=========================================="
    echo ""
    
    for country in "${COUNTRIES[@]}"; do
        echo "🔍 Vérification de $country.lobbydezinzin.com..."
        
        local status="OK"
        local issues=()
        
        # Test 1: Résolution DNS
        if test_dns_resolution "$country"; then
            log_success "Résolution DNS: OK"
        else
            log_error "Résolution DNS: ÉCHEC"
            status="ERROR"
            issues+=("DNS resolution failed")
        fi
        
        # Test 2: Connectivité
        if test_connectivity "$country"; then
            log_success "Connectivité: OK"
        else
            log_warning "Connectivité: PROBLÈME"
            if [ "$status" != "ERROR" ]; then
                status="WARNING"
            fi
            issues+=("Connectivity issues")
        fi
        
        # Test 3: Latence
        local latency=$(test_latency "$country")
        if [ "$latency" != "timeout" ]; then
            if [ "$latency" -lt 100 ]; then
                log_success "Latence: ${latency}ms (Excellent)"
            elif [ "$latency" -lt 500 ]; then
                log_success "Latence: ${latency}ms (Bon)"
            else
                log_warning "Latence: ${latency}ms (Élevée)"
                if [ "$status" != "ERROR" ]; then
                    status="WARNING"
                fi
                issues+=("High latency: ${latency}ms")
            fi
        else
            log_error "Latence: TIMEOUT"
            status="ERROR"
            issues+=("Latency timeout")
        fi
        
        # Test 4: Enregistrements Warzone
        local warzone_test=$(test_warzone_records "$country")
        if [ $? -eq 0 ]; then
            log_success "Enregistrements Warzone: OK"
        else
            log_warning "Enregistrements Warzone: PROBLÈME ($warzone_test)"
            if [ "$status" != "ERROR" ]; then
                status="WARNING"
            fi
            issues+=("Missing Warzone records: $warzone_test")
        fi
        
        # Résumé du pays
        case $status in
            "OK")
                echo -e "${GREEN}✅ $country: TOUT VA BIEN${NC}"
                ((healthy_countries++))
                ;;
            "WARNING")
                echo -e "${YELLOW}⚠️  $country: ATTENTION${NC}"
                ((warning_countries++))
                ;;
            "ERROR")
                echo -e "${RED}❌ $country: ERREUR${NC}"
                ((error_countries++))
                send_alert "$country" "${issues[*]}"
                ;;
        esac
        
        if [ ${#issues[@]} -gt 0 ]; then
            echo "   Problèmes détectés:"
            for issue in "${issues[@]}"; do
                echo "   - $issue"
            done
        fi
        
        echo ""
    done
    
    # Résumé global
    echo "=========================================="
    echo "📊 RÉSUMÉ DU MONITORING"
    echo "=========================================="
    echo -e "${GREEN}✅ Pays sains: $healthy_countries/$total_countries${NC}"
    echo -e "${YELLOW}⚠️  Pays avec avertissements: $warning_countries/$total_countries${NC}"
    echo -e "${RED}❌ Pays en erreur: $error_countries/$total_countries${NC}"
    echo ""
    
    # Calcul du pourcentage de santé
    local health_percentage=$(( (healthy_countries * 100) / total_countries ))
    echo "🏥 Santé globale: $health_percentage%"
    
    # Recommandations
    if [ $error_countries -gt 0 ]; then
        echo ""
        log_error "🚨 Actions recommandées:"
        echo "   1. Vérifier les serveurs DNS en erreur"
        echo "   2. Contrôler la connectivité réseau"
        echo "   3. Vérifier la configuration PowerDNS"
    elif [ $warning_countries -gt 0 ]; then
        echo ""
        log_warning "⚠️  Actions recommandées:"
        echo "   1. Surveiller les pays avec avertissements"
        echo "   2. Optimiser la latence si nécessaire"
    else
        echo ""
        log_success "🎉 Tous les DNS fonctionnent parfaitement !"
    fi
    
    log_info "Monitoring terminé"
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -c, --country  Tester un pays spécifique"
    echo "  -l, --log      Afficher les logs"
    echo "  -v, --verbose  Mode verbeux"
    echo ""
    echo "Exemples:"
    echo "  $0                    # Monitoring complet"
    echo "  $0 -c nigeria         # Tester seulement le Nigeria"
    echo "  $0 -l                 # Afficher les logs"
}

# Gestion des arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -c|--country)
        if [ -z "$2" ]; then
            log_error "Pays non spécifié"
            exit 1
        fi
        COUNTRIES=("$2")
        main
        ;;
    -l|--log)
        if [ -f "$LOG_FILE" ]; then
            tail -50 "$LOG_FILE"
        else
            log_warning "Fichier de log non trouvé"
        fi
        exit 0
        ;;
    -v|--verbose)
        set -x
        main
        ;;
    "")
        main
        ;;
    *)
        log_error "Option inconnue: $1"
        show_help
        exit 1
        ;;
esac 