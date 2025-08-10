#!/bin/bash

# Script de déploiement pour LobbyDeZinzin

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Répertoire du projet
PROJECT_DIR="/opt/lobbydezinzin"

# Fonction de log
log() {
    echo -e "${YELLOW}[DEPLOY]${NC} $1"
}

# Aller dans le répertoire du projet
cd $PROJECT_DIR

# Mise à jour du code
log "🔄 Mise à jour du code depuis GitHub"
git fetch origin
git reset --hard origin/main

# Installation des dépendances
log "📦 Installation des dépendances"
npm install

# Construction du projet
log "🏗️ Construction du projet"
npm run build

# Redémarrage du service
log "🚀 Redémarrage du service"
pm2 restart lobbydezinzin

# Vérification du statut
log "✅ Déploiement terminé"
pm2 status lobbydezinzin

echo -e "${GREEN}Déploiement réussi !${NC}"
