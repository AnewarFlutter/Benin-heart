@echo off
REM Script d'arrêt du backend Shoemaker pour Windows
REM Usage: stop_backend.bat

echo ==========================================
echo    ARRET DU BACKEND SHOEMAKER
echo ==========================================
echo.

REM Se déplacer dans le répertoire backendShoemaker
echo Navigation vers backendShoemaker...
cd /d "%~dp0backendShoemaker"
if errorlevel 1 (
    echo ERREUR: Impossible de trouver le dossier backendShoemaker
    pause
    exit /b 1
)
echo OK: Repertoire: %CD%
echo.

REM Arrêter Docker Compose
echo Arret des services Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo Aucun service Docker en cours d'execution
) else (
    docker-compose down
    echo OK: Services Docker arretes
)
echo.

echo ==========================================
echo    BACKEND ARRETE
echo ==========================================
echo.
echo Pour redemarrer le backend, executez:
echo   start_backend.bat
echo.
pause
