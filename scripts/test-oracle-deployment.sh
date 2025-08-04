#!/bin/bash

# Script de test déploiement Oracle Cloud Free - LobbyDeZinzin
# Valide que tous les services fonctionnent correctement après déploiement

set -e

echo "🧪 Test de Déploiement Oracle Cloud Free - LobbyDeZinzin"
echo "======================================================"

# Variables
ORACLE_IP=${1:-$(curl -s ifconfig.me)}
WEB_PORT=3000
DNS_PORT=53
TEST_DOMAIN="google.com"

echo "🔧 Configuration de test:"
echo "   • IP Oracle: $ORACLE_IP"
echo "   • Port Web: $WEB_PORT"
echo "   • Port DNS: $DNS_PORT"
echo ""

# Compteurs de tests
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=10

# Fonction de test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -n "🧪 Test: $test_name... "
    
    if eval $test_command >/dev/null 2>&1; then
        echo "✅ PASS"
        ((TESTS_PASSED++))
    else
        echo "❌ FAIL"
        ((TESTS_FAILED++))
        echo "   Commande: $test_command"
    fi
}

echo "🚀 Début des tests système..."
echo ""

# Test 1: Connectivité réseau
run_test "Connectivité Internet" "ping -c 1 8.8.8.8"

# Test 2: Services systemd
run_test "Service Smart DNS" "systemctl is-active --quiet lobbydezinzin-dns"
run_test "Service Web App" "systemctl is-active --quiet lobbydezinzin-web"  
run_test "Service Nginx" "systemctl is-active --quiet nginx"

# Test 3: Ports ouverts localement
run_test "Port DNS (53/UDP) ouvert" "netstat -ulnp | grep ':53 '"
run_test "Port Web (3000/TCP) ouvert" "netstat -tlnp | grep ':3000 '"

# Test 4: Smart DNS fonctionnel
echo "🧪 Test: Smart DNS résolution DNS... "
if timeout 10 dig @$ORACLE_IP $TEST_DOMAIN +short > /dev/null 2>&1; then
    echo "✅ PASS"
    ((TESTS_PASSED++))
else
    echo "❌ FAIL - Smart DNS ne répond pas"
    ((TESTS_FAILED++))
fi

# Test 5: Application web locale
echo "🧪 Test: Application web locale... "
if timeout 10 curl -s http://localhost:$WEB_PORT > /dev/null 2>&1; then
    echo "✅ PASS"
    ((TESTS_PASSED++))
else
    echo "❌ FAIL - App web locale inaccessible"
    ((TESTS_FAILED++))
fi

# Test 6: Application web publique
echo "🧪 Test: Application web publique... "
if timeout 10 curl -s http://$ORACLE_IP:$WEB_PORT > /dev/null 2>&1; then
    echo "✅ PASS"
    ((TESTS_PASSED++))
else
    echo "❌ FAIL - App web publique inaccessible (vérifiez Security Lists Oracle)"
    ((TESTS_FAILED++))
fi

# Test 7: Base de données
echo "🧪 Test: Base de données Prisma... "
cd /opt/lobbydezinzin 2>/dev/null || cd .
if timeout 10 npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    echo "✅ PASS"
    ((TESTS_PASSED++))
else
    echo "❌ FAIL - Problème base de données"
    ((TESTS_FAILED++))
fi

echo ""
echo "📊 RÉSULTATS DES TESTS"
echo "====================="
echo "✅ Tests réussis: $TESTS_PASSED/$TOTAL_TESTS"
echo "❌ Tests échoués: $TESTS_FAILED/$TOTAL_TESTS"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo "🎉 TOUS LES TESTS PASSÉS !"
    echo "🚀 LobbyDeZinzin est opérationnel sur Oracle Cloud Free"
    echo ""
    echo "🌐 ACCÈS:"
    echo "   • Site: http://$ORACLE_IP:$WEB_PORT"
    echo "   • Admin: http://$ORACLE_IP:$WEB_PORT/admin"
    echo "   • Smart DNS: $ORACLE_IP (port 53/UDP)"
    echo ""
    echo "🎮 CONFIGURATION CONSOLE:"
    echo "   • DNS Primaire: $ORACLE_IP"
    echo "   • DNS Secondaire: 8.8.8.8"
    echo ""
    echo "🔐 COMPTES:"
    echo "   • Admin: admin@lobbydezinzin.com / Admin123!"
    echo "   • Test: test@lobbydezinzin.com / Test123!"
    
    exit 0
else
    echo ""
    echo "⚠️ CERTAINS TESTS ONT ÉCHOUÉ"
    echo ""
    echo "🔧 ACTIONS CORRECTIVES:"
    
    if ! systemctl is-active --quiet lobbydezinzin-dns; then
        echo "   • Smart DNS: journalctl -u lobbydezinzin-dns -f"
    fi
    
    if ! systemctl is-active --quiet lobbydezinzin-web; then
        echo "   • Web App: journalctl -u lobbydezinzin-web -f"
    fi
    
    if ! timeout 5 curl -s http://$ORACLE_IP:$WEB_PORT > /dev/null 2>&1; then
        echo "   • Oracle Security Lists: Vérifiez port $WEB_PORT/TCP"
    fi
    
    if ! timeout 5 dig @$ORACLE_IP $TEST_DOMAIN +short > /dev/null 2>&1; then
        echo "   • Oracle Security Lists: Vérifiez port $DNS_PORT/UDP"
    fi
    
    echo ""
    echo "📋 ORACLE CLOUD SECURITY LISTS REQUISES:"
    echo "   • Ingress 0.0.0.0/0 → Port 53/UDP (Smart DNS)"
    echo "   • Ingress 0.0.0.0/0 → Port 3000/TCP (Web App)"
    echo "   • Ingress 0.0.0.0/0 → Port 80/TCP (HTTP)"
    
    exit 1
fi