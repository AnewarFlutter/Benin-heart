#!/bin/bash

# Script de démarrage du backend Shoemaker
# Usage: ./start_backend.sh

set -e  # Arrêter le script en cas d'erreur

echo "=========================================="
echo "   DÉMARRAGE DU BACKEND SHOEMAKER"
echo "=========================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si Python est installé
echo -e "${YELLOW}[1/7] Vérification de Python...${NC}"
if ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Python n'est pas installé. Veuillez installer Python 3.x${NC}"
    exit 1
fi
PYTHON_VERSION=$(python --version)
echo -e "${GREEN}✓ Python installé: $PYTHON_VERSION${NC}"
echo ""

# Se déplacer dans le répertoire backendShoemaker
echo -e "${YELLOW}[2/7] Navigation vers backendShoemaker...${NC}"
cd "$(dirname "$0")/backendShoemaker" || exit 1
echo -e "${GREEN}✓ Répertoire: $(pwd)${NC}"
echo ""

# Créer le venv s'il n'existe pas
echo -e "${YELLOW}[3/7] Configuration de l'environnement virtuel...${NC}"
if [ ! -d "venv" ]; then
    echo "Création du venv..."
    python -m venv venv
    echo -e "${GREEN}✓ Venv créé${NC}"
else
    echo -e "${GREEN}✓ Venv existe déjà${NC}"
fi
echo ""

# Activer le venv
echo -e "${YELLOW}[4/7] Activation de l'environnement virtuel...${NC}"
source venv/Scripts/activate || source venv/bin/activate
echo -e "${GREEN}✓ Venv activé${NC}"
echo ""

# Installer les dépendances
echo -e "${YELLOW}[5/7] Installation des dépendances...${NC}"
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt
echo -e "${GREEN}✓ Dépendances installées${NC}"
echo ""

# Vérifier si Docker est installé et lancé
echo -e "${YELLOW}[6/7] Démarrage des services Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé. Veuillez installer Docker${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop${NC}"
    exit 1
fi

echo "Démarrage de docker-compose..."
docker-compose up --build -d
echo -e "${GREEN}✓ Services Docker démarrés${NC}"
echo ""

# Attendre que PostgreSQL soit prêt
echo "Attente du démarrage de PostgreSQL..."
sleep 5

# Exécuter les migrations
echo "Exécution des migrations..."
python manage.py migrate
echo -e "${GREEN}✓ Migrations appliquées${NC}"
echo ""

# Créer un superutilisateur si nécessaire
echo -e "${YELLOW}[7/7] Configuration du superutilisateur...${NC}"
echo ""
echo "Voulez-vous créer un superutilisateur? (o/n)"
read -r CREATE_SUPERUSER

if [[ "$CREATE_SUPERUSER" == "o" || "$CREATE_SUPERUSER" == "O" ]]; then
    python manage.py createsuperuser
    echo -e "${GREEN}✓ Superutilisateur créé${NC}"
else
    echo -e "${YELLOW}⊘ Création du superutilisateur ignorée${NC}"
fi
echo ""

# Démarrer le serveur
echo "=========================================="
echo -e "${GREEN}   BACKEND PRÊT À DÉMARRER${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}Démarrage du serveur Django...${NC}"
echo ""
echo "Le serveur sera accessible à: http://localhost:8000"
echo "Admin panel: http://localhost:8000/admin"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

python manage.py runserver
