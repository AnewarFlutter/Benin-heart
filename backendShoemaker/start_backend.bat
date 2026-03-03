@echo off
REM Script de démarrage du backend Shoemaker pour Windows
REM Usage: start_backend.bat

echo ==========================================
echo    DEMARRAGE DU BACKEND SHOEMAKER
echo ==========================================
echo.

REM Vérifier si Python est installé
echo [1/7] Verification de Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe. Veuillez installer Python 3.x
    pause
    exit /b 1
)
python --version
echo OK: Python installe
echo.

REM Se déplacer dans le répertoire backendShoemaker
echo [2/7] Navigation vers backendShoemaker...
cd /d "%~dp0backendShoemaker"
if errorlevel 1 (
    echo ERREUR: Impossible de trouver le dossier backendShoemaker
    pause
    exit /b 1
)
echo OK: Repertoire: %CD%
echo.

REM Créer le venv s'il n'existe pas
echo [3/7] Configuration de l'environnement virtuel...
if not exist "venv" (
    echo Creation du venv...
    python -m venv venv
    echo OK: Venv cree
) else (
    echo OK: Venv existe deja
)
echo.

REM Activer le venv
echo [4/7] Activation de l'environnement virtuel...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERREUR: Impossible d'activer le venv
    pause
    exit /b 1
)
echo OK: Venv active
echo.

REM Installer les dépendances
echo [5/7] Installation des dependances...
python -m pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
echo OK: Dependances installees
echo.

REM Vérifier si Docker est installé et lancé
echo [6/7] Demarrage des services Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Docker n'est pas installe. Veuillez installer Docker Desktop
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Docker n'est pas demarre. Veuillez demarrer Docker Desktop
    pause
    exit /b 1
)

echo Demarrage de docker-compose...
docker-compose up --build -d
echo OK: Services Docker demarres
echo.

REM Attendre que PostgreSQL soit prêt
echo Attente du demarrage de PostgreSQL...
timeout /t 5 /nobreak >nul

REM Exécuter les migrations
echo Execution des migrations...
python manage.py migrate
echo OK: Migrations appliquees
echo.

REM Créer un superutilisateur si nécessaire
echo [7/7] Configuration du superutilisateur...
echo.
set /p CREATE_SUPERUSER="Voulez-vous creer un superutilisateur? (o/n): "

if /i "%CREATE_SUPERUSER%"=="o" (
    python manage.py createsuperuser
    echo OK: Superutilisateur cree
) else (
    echo Creation du superutilisateur ignoree
)
echo.

REM Démarrer le serveur
echo ==========================================
echo    BACKEND PRET A DEMARRER
echo ==========================================
echo.
echo Demarrage du serveur Django...
echo.
echo Le serveur sera accessible a: http://localhost:8000
echo Admin panel: http://localhost:8000/admin
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

python manage.py runserver
