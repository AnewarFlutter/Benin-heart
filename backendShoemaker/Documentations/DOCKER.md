# Guide Docker - Shoemaker API

Ce guide explique comment démarrer le projet avec Docker en développement local et en production.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Développement Local](#développement-local)
- [Production](#production)
- [Commandes Utiles](#commandes-utiles)
- [Troubleshooting](#troubleshooting)

---

## Prérequis

- **Docker** : >= 20.10
- **Docker Compose** : >= 2.0

### Installation Docker

**Windows/Mac** : [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Linux** :
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install docker-compose-plugin
```

Vérifier l'installation :
```bash
docker --version
docker compose version
```

---

## 🔧 Développement Local

### 1. Configuration

Le fichier `docker-compose.yml` est déjà configuré pour le développement.

**Services inclus :**
- ✅ Django (port 8000)
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ pgAdmin (port 5050) - Interface graphique pour PostgreSQL

### 2. Démarrer le projet

```bash
# Construire les images Docker
docker compose build

# Démarrer tous les services
docker compose up

# Ou en arrière-plan (detached mode)
docker compose up -d
```

### 3. Accéder à l'application

- **API** : http://localhost:8000
- **Admin Django** : http://localhost:8000/admin
  - Email : `admin@admin.com`
  - Password : `admin123`
- **pgAdmin** : http://localhost:5050
  - Email : `admin@admin.com`
  - Password : `admin`

### 4. Voir les logs

```bash
# Tous les services
docker compose logs -f

# Service spécifique
docker compose logs -f web
docker compose logs -f db
```

### 5. Arrêter les services

```bash
# Arrêter
docker compose stop

# Arrêter et supprimer les conteneurs
docker compose down

# Arrêter et supprimer volumes (⚠️ supprime les données)
docker compose down -v
```

### 6. Commandes Django dans Docker

```bash
# Exécuter des commandes Django
docker compose exec web python manage.py [command]

# Exemples
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
docker compose exec web python manage.py shell

# Accéder au shell du conteneur
docker compose exec web bash
```

### 7. Hot Reload (Développement)

Le code source est monté comme volume, donc **les modifications sont automatiquement détectées** par Django sans redémarrer le conteneur.

Si vous modifiez `requirements.txt`, reconstruisez l'image :
```bash
docker compose up --build
```

---

## 🚀 Production

### 1. Configuration

Créer un fichier `.env` pour la production :

```bash
cp .env.prod .env
```

Éditer `.env` et **changer toutes les valeurs sensibles** :

```env
# Django Settings
DEBUG=False
ENVIRONMENT=production
SECRET_KEY=your-super-secret-key-here-min-50-chars
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DB_NAME=shoemaker_db
DB_USER=shoemaker_user
DB_PASSWORD=your-secure-database-password

# Redis
REDIS_PASSWORD=your-secure-redis-password

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

### 2. Configuration Nginx

Modifier `nginx/conf.d/shoemaker.conf` :

Remplacer `your-domain.com` par votre nom de domaine :

```nginx
server_name your-actual-domain.com www.your-actual-domain.com;
```

### 3. SSL avec Let's Encrypt

#### A. Première installation (sans SSL)

Commenter temporairement les lignes SSL dans `nginx/conf.d/shoemaker.conf` :

```nginx
# ssl_certificate /etc/nginx/ssl/certbot/conf/live/your-domain.com/fullchain.pem;
# ssl_certificate_key /etc/nginx/ssl/certbot/conf/live/your-domain.com/privkey.pem;
```

Démarrer sans SSL :
```bash
docker compose -f docker-compose.prod.yml up -d nginx
```

#### B. Obtenir le certificat SSL

```bash
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

#### C. Activer SSL

Décommenter les lignes SSL dans `nginx/conf.d/shoemaker.conf`, puis redémarrer :

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

### 4. Démarrer en production

```bash
# Construire les images
docker compose -f docker-compose.prod.yml build

# Démarrer tous les services
docker compose -f docker-compose.prod.yml up -d

# Vérifier le statut
docker compose -f docker-compose.prod.yml ps
```

### 5. Migrations et collectstatic

Ces commandes s'exécutent automatiquement au démarrage via `entrypoint.sh`.

Pour les exécuter manuellement :

```bash
docker compose -f docker-compose.prod.yml exec web python manage.py migrate
docker compose -f docker-compose.prod.yml exec web python manage.py collectstatic
```

### 6. Créer un superuser en production

```bash
docker compose -f docker-compose.prod.yml exec web python manage.py createsuperuser
```

### 7. Logs en production

```bash
# Voir tous les logs
docker compose -f docker-compose.prod.yml logs -f

# Logs spécifiques
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f nginx
```

### 8. Sauvegardes de la base de données

#### Créer une sauvegarde

```bash
docker compose -f docker-compose.prod.yml exec db pg_dump \
  -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Restaurer une sauvegarde

```bash
docker compose -f docker-compose.prod.yml exec -T db psql \
  -U $DB_USER $DB_NAME < backup_20231215_120000.sql
```

### 9. Mises à jour du code

```bash
# 1. Pull les dernières modifications
git pull

# 2. Reconstruire l'image
docker compose -f docker-compose.prod.yml build web

# 3. Redémarrer le service web
docker compose -f docker-compose.prod.yml up -d web

# 4. Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f web
```

---

## 🛠️ Commandes Utiles

### Gestion des conteneurs

```bash
# Voir les conteneurs en cours d'exécution
docker compose ps

# Arrêter un service spécifique
docker compose stop web

# Redémarrer un service
docker compose restart web

# Supprimer tous les conteneurs
docker compose down
```

### Gestion des images

```bash
# Voir les images Docker
docker images

# Supprimer les images inutilisées
docker image prune -a

# Reconstruire une image spécifique
docker compose build web
```

### Gestion des volumes

```bash
# Voir les volumes
docker volume ls

# Supprimer les volumes inutilisés
docker volume prune

# Inspecter un volume
docker volume inspect shoemaker_postgres_data
```

### Nettoyage complet

```bash
# Supprimer conteneurs, réseaux, images, et volumes inutilisés
docker system prune -a --volumes

# ⚠️ Attention : cela supprime TOUTES les données !
```

### Accéder aux services

```bash
# Shell dans le conteneur web
docker compose exec web bash

# Shell PostgreSQL
docker compose exec db psql -U postgres shoemaker_db

# Shell Redis
docker compose exec redis redis-cli
```

---

## 🐛 Troubleshooting

### Problème : Port déjà utilisé

**Erreur** : `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution** :
```bash
# Voir ce qui utilise le port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                  # Mac/Linux

# Arrêter le processus ou changer le port dans docker-compose.yml
```

### Problème : Permission denied sur entrypoint.sh

**Erreur** : `permission denied: /app/entrypoint.sh`

**Solution** :
```bash
# Rendre le script exécutable
chmod +x entrypoint.sh

# Reconstruire l'image
docker compose build
```

### Problème : Migrations ne s'appliquent pas

**Solution** :
```bash
# Forcer les migrations
docker compose exec web python manage.py migrate --run-syncdb

# Ou recréer la base de données
docker compose down -v
docker compose up -d
```

### Problème : Connexion à PostgreSQL échoue

**Vérifier** :
```bash
# Vérifier que la base de données est prête
docker compose exec db pg_isready -U postgres

# Vérifier les logs
docker compose logs db
```

### Problème : Static files non trouvés

**Solution** :
```bash
docker compose exec web python manage.py collectstatic --clear --noinput
```

### Problème : Out of memory / Espace disque plein

**Solution** :
```bash
# Nettoyer Docker
docker system df                    # Voir l'utilisation
docker system prune -a --volumes    # Nettoyer
```

---

## 📊 Monitoring en Production

### Voir l'utilisation des ressources

```bash
# Stats en temps réel
docker stats

# Stats d'un conteneur spécifique
docker stats shoemaker_web_prod
```

### Health checks

```bash
# Vérifier l'état des services
docker compose -f docker-compose.prod.yml ps

# Tester le health check endpoint
curl http://your-domain.com/health/
```

---

## 🔐 Sécurité Production

### Checklist

- ✅ Changer `SECRET_KEY` (min 50 caractères aléatoires)
- ✅ Changer tous les mots de passe par défaut
- ✅ Activer SSL/HTTPS avec Let's Encrypt
- ✅ Configurer `ALLOWED_HOSTS` correctement
- ✅ Configurer `CORS_ALLOWED_ORIGINS` pour le frontend
- ✅ Désactiver `DEBUG=False`
- ✅ Utiliser des variables d'environnement pour les secrets
- ✅ Configurer des sauvegardes automatiques de la DB
- ✅ Mettre en place un système de monitoring

---

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

## 🆘 Support

Pour toute question ou problème :
1. Vérifier les logs : `docker compose logs -f`
2. Consulter ce guide
3. Vérifier la documentation officielle
