# 📜 Scripts de Démarrage - Backend Shoemaker

Ce document explique tous les scripts disponibles pour faciliter le développement.

## 📁 Structure des Scripts

```
My_Shoemaker_App/
├── start_backend.sh          # Script de démarrage (Linux/Mac/Git Bash)
├── start_backend.bat         # Script de démarrage (Windows)
├── stop_backend.sh           # Script d'arrêt (Linux/Mac/Git Bash)
├── stop_backend.bat          # Script d'arrêt (Windows)
├── DEMARRAGE_BACKEND.md      # Documentation complète du backend
└── README_SCRIPTS.md         # Ce fichier
```

## 🚀 Démarrage Rapide

### Windows

```cmd
# Démarrer le backend
start_backend.bat

# Arrêter le backend
stop_backend.bat
```

### Linux / Mac / Git Bash

```bash
# Démarrer le backend
./start_backend.sh

# Arrêter le backend
./stop_backend.sh
```

## 📋 Que fait le script `start_backend` ?

Le script automatise toutes les étapes nécessaires pour démarrer le backend :

1. ✅ **Vérifie Python** - S'assure que Python est installé
2. ✅ **Navigation** - Se déplace dans le dossier `backendShoemaker`
3. ✅ **Environnement virtuel** - Crée le venv s'il n'existe pas
4. ✅ **Activation** - Active l'environnement virtuel
5. ✅ **Dépendances** - Installe toutes les dépendances Python
6. ✅ **Docker** - Démarre les services Docker (PostgreSQL, Redis, etc.)
7. ✅ **Migrations** - Applique les migrations de la base de données
8. ✅ **Superutilisateur** - Propose de créer un compte admin
9. ✅ **Serveur Django** - Lance le serveur de développement

## 📋 Que fait le script `stop_backend` ?

Le script arrête proprement tous les services :

1. ✅ **Docker Compose** - Arrête tous les conteneurs Docker
2. ✅ **Nettoyage** - Libère les ressources

## 🎯 Utilisation Détaillée

### Premier Lancement

1. **Ouvrez un terminal** dans le dossier `My_Shoemaker_App`

2. **Exécutez le script de démarrage** :
   ```bash
   # Windows
   start_backend.bat

   # Linux/Mac/Git Bash
   ./start_backend.sh
   ```

3. **Créez un superutilisateur** lorsque le script vous le demande :
   - Répondez `o` (oui) à la question
   - Entrez un nom d'utilisateur (ex: `admin`)
   - Entrez une adresse email (ex: `admin@shoemaker.com`)
   - Entrez un mot de passe (min. 8 caractères)

4. **Le serveur démarre** automatiquement
   - Backend API : http://localhost:8000
   - Admin Django : http://localhost:8000/admin

### Lancements Suivants

Pour les lancements suivants, le script est encore plus rapide car :
- Le venv existe déjà
- Les dépendances sont déjà installées
- Le superutilisateur existe déjà

Exécutez simplement :
```bash
./start_backend.sh    # ou start_backend.bat sur Windows
```

### Arrêt du Backend

Quand vous avez fini de travailler :

1. **Arrêtez le serveur Django** : Appuyez sur `Ctrl + C` dans le terminal

2. **Arrêtez Docker** (optionnel) :
   ```bash
   ./stop_backend.sh    # ou stop_backend.bat sur Windows
   ```

## 🔧 Commandes Manuelles Utiles

Si vous préférez avoir plus de contrôle, voici les commandes principales :

### Démarrage Manuel

```bash
cd backendShoemaker

# Activer le venv
source venv/Scripts/activate  # Git Bash
# ou
venv\Scripts\activate.bat     # Windows CMD

# Démarrer Docker
docker-compose up -d

# Démarrer le serveur
python manage.py runserver
```

### Migration de la Base de Données

```bash
cd backendShoemaker
source venv/Scripts/activate

# Créer de nouvelles migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate
```

### Peupler la Base de Données

```bash
cd backendShoemaker
source venv/Scripts/activate

# Ajouter 20 entrées par table
python manage.py populate_database

# Supprimer et recréer les données
python manage.py populate_database --clear
```

### Créer un Superutilisateur

```bash
cd backendShoemaker
source venv/Scripts/activate

python manage.py createsuperuser
```

### Voir les Logs Docker

```bash
cd backendShoemaker

# Tous les logs
docker-compose logs -f

# Logs PostgreSQL uniquement
docker-compose logs -f postgres

# Logs Redis uniquement
docker-compose logs -f redis
```

### Tests

```bash
cd backendShoemaker
source venv/Scripts/activate

# Lancer tous les tests
python manage.py test

# Lancer les tests d'une app spécifique
python manage.py test apps.users

# Lancer avec couverture
coverage run --source='.' manage.py test
coverage report
```

## 🐛 Résolution de Problèmes

### Problème : "Python n'est pas reconnu"

**Solution** : Python n'est pas installé ou pas dans le PATH
1. Installez Python depuis https://www.python.org/downloads/
2. Cochez "Add Python to PATH" pendant l'installation

### Problème : "Docker n'est pas démarré"

**Solution** : Démarrez Docker Desktop
1. Ouvrez Docker Desktop
2. Attendez que l'icône soit verte
3. Relancez le script

### Problème : "Port 8000 already in use"

**Solution** : Un autre serveur utilise le port
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

Ou utilisez un autre port :
```bash
python manage.py runserver 8001
```

### Problème : "Permission denied" (Linux/Mac)

**Solution** : Donnez les permissions d'exécution
```bash
chmod +x start_backend.sh
chmod +x stop_backend.sh
```

### Problème : Scripts ne s'exécutent pas dans PowerShell

**Solution** : PowerShell bloque les scripts par défaut
```powershell
# Option 1 : Utiliser CMD à la place
start_backend.bat

# Option 2 : Autoriser les scripts (Admin requis)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📊 Workflow de Développement Recommandé

### Configuration Initiale (Une seule fois)

1. Cloner le repository
2. Exécuter `start_backend.bat` ou `start_backend.sh`
3. Créer un superutilisateur
4. Peupler la base de données avec `python manage.py populate_database`

### Routine Quotidienne

**Matin** :
```bash
./start_backend.sh              # Démarrer tout
```

**Pendant le développement** :
- Le serveur Django redémarre automatiquement quand vous modifiez le code
- Gardez un œil sur les logs dans le terminal

**Soir** :
```bash
# Ctrl+C pour arrêter le serveur
./stop_backend.sh               # Arrêter Docker
```

### Après un `git pull`

```bash
cd backendShoemaker
source venv/Scripts/activate

# Mettre à jour les dépendances
pip install -r requirements.txt

# Appliquer les nouvelles migrations
python manage.py migrate

# Redémarrer le serveur
python manage.py runserver
```

## 🌐 URLs Importantes

Une fois le backend démarré :

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Backend API** | http://localhost:8000 | - |
| **Admin Django** | http://localhost:8000/admin | Votre superutilisateur |
| **API Docs** | http://localhost:8000/api/docs/ | - |
| **PostgreSQL** | localhost:5432 | Voir `.env` |
| **Redis** | localhost:6379 | - |

##  Frontend

Pour démarrer le frontend, dans un autre terminal :

```bash
cd view_utilisateurs
npm install
npm run dev
```

Le frontend sera accessible à : http://localhost:3000

## 🔐 Sécurité

⚠️ **Important pour la production** :

- Les scripts sont conçus pour le **développement local uniquement**
- Ne jamais utiliser `DEBUG=True` en production
- Changer le `SECRET_KEY` en production
- Utiliser des variables d'environnement sécurisées
- Configurer HTTPS et les certificats SSL

## 💡 Conseils

### Multi-Terminal

Gardez 3 terminaux ouverts pour un workflow optimal :

**Terminal 1** - Backend :
```bash
./start_backend.sh
```

**Terminal 2** - Frontend :
```bash
cd view_utilisateurs
npm run dev
```

**Terminal 3** - Commandes :
```bash
# Pour les migrations, tests, etc.
cd backendShoemaker
source venv/Scripts/activate
```

### Auto-Reload

Django recharge automatiquement quand vous modifiez :
- ✅ Les fichiers Python (`.py`)
- ✅ Les templates (`.html`)
- ❌ Les fichiers settings (redémarrage requis)
- ❌ Les migrations (à appliquer manuellement)

### Base de Données

Si vous voulez repartir de zéro :

```bash
cd backendShoemaker

# Arrêter Docker
docker-compose down -v  # -v supprime les volumes

# Redémarrer tout
./start_backend.sh
```
## NB : Avant de se mettre à modifier le backend, prenez connaissance d'abord de l'architecture. 

# Les ressources sur la documentation de l'architecture se trouvent dans 

```bash
cd backendShoemaker/Documentations
```

# Après lecture de la clean architecture, pour créer un module, il suffit d'exécuter :

```bash
cd backendShoemaker

# Ceci pour créer un module (application)
python create_django_app.py
```

## Pour voir ou tester les endpoints

1. Utiliser le Swagger : lien(http://127.0.0.1:8000/api/docs)
2. Importer la collection dans Postman (aller dans `backendShoemaker/Documentations/Postman_Collections`)

---

**Bon développement !**
