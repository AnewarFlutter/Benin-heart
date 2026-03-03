#!/bin/bash

# Script d'arrêt du backend Shoemaker
# Usage: ./stop_backend.sh

echo "=========================================="
echo "   ARRÊT DU BACKEND SHOEMAKER"
echo "=========================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Se déplacer dans le répertoire backendShoemaker
echo -e "${YELLOW}Navigation vers backendShoemaker...${NC}"
cd "$(dirname "$0")/backendShoemaker" || exit 1
echo -e "${GREEN}✓ Répertoire: $(pwd)${NC}"
echo ""

# Arrêter Docker Compose
echo -e "${YELLOW}Arrêt des services Docker...${NC}"
if command -v docker &> /dev/null; then
    if docker-compose ps &> /dev/null; then
        docker-compose down
        echo -e "${GREEN}✓ Services Docker arrêtés${NC}"
    else
        echo -e "${YELLOW}⊘ Aucun service Docker en cours d'exécution${NC}"
    fi
else
    echo -e "${YELLOW}⊘ Docker n'est pas installé${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}   BACKEND ARRÊTÉ${NC}"
echo "=========================================="
echo ""
echo "Pour redémarrer le backend, exécutez:"
echo "  ./start_backend.sh"
echo ""
