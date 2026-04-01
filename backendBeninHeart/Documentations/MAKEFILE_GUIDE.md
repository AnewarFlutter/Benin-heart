# 📖 Guide Makefile - Shoemaker API

## 🎯 Introduction

Le Makefile contient des **raccourcis de commandes** pour faciliter le développement et le déploiement de l'application Shoemaker.

Au lieu de taper des commandes longues comme:
```bash
docker compose -f docker-compose.prod.yml exec web python manage.py migrate
```

Vous pouvez simplement taper:
```bash
make prod-migrate
```

---

## 📋 Commandes disponibles

Pour voir toutes les commandes:
```bash
make help
```

---

## 🚀 Développement

### Démarrage initial

```bash
# Construire les images Docker
make build

# Démarrer tous les services (db, redis, celery_worker, celery_beat, flower)
make up

# Ou combiner les deux (build + up)
make start
```

**Résultat:**
- API: http://localhost:8000
- Admin Django: http://localhost:8000/admin
- Swagger: http://localhost:8000/api/schema/swagger-ui/
- pgAdmin: http://localhost:5050
- Flower (Celery): http://localhost:5555

### Arrêter les services

```bash
# Arrêter tous les services
make down

# Arrêter + nettoyer (supprimer volumes)
make clean

# Redémarrer
make restart
```

### Logs

```bash
# Voir tous les logs en temps réel
make logs

# Logs Celery Worker
make celery-logs

# Logs Celery Beat
make celery-beat-logs

# Logs Flower
make celery-flower-logs
```

---

## 🐘 Base de données

### Migrations

```bash
# Créer des migrations
make makemigrations

# Appliquer les migrations
make migrate

# Créer un superuser
make createsuperuser
```

### Sauvegarde et restauration

```bash
# Créer une sauvegarde
make backup-db
# Crée un fichier: backup_20251218_143000.sql

# Restaurer depuis une sauvegarde
make restore-db
# Vous demandera le nom du fichier
```

---

## ⚙️ Celery

### Démarrer Celery en local (sans Docker)

```bash
# Terminal 1 - Worker
make celery-worker

# Terminal 2 - Beat (tâches périodiques)
make celery-beat

# Terminal 3 - Flower (monitoring web)
make celery-flower
```

### Gérer Celery avec Docker

```bash
# Voir les logs du worker
make celery-logs

# Redémarrer les workers
make celery-restart

# Voir les tâches actives
make celery-inspect

# Statistiques du worker
make celery-stats

# Purger toutes les tâches en attente (⚠️ ATTENTION!)
make celery-purge
```

### Ouvrir Flower dans le navigateur

```bash
make flower
```
Ouvre automatiquement http://localhost:5555 dans votre navigateur.

---

## 🔴 Redis

### Accéder au CLI Redis

```bash
make redis-cli
```

Commandes utiles dans Redis CLI:
```redis
# Tester la connexion
PING

# Voir toutes les clés
KEYS *

# Voir les tâches Celery
LLEN celery

# Voir une clé spécifique
GET ma_cle

# Supprimer une clé
DEL ma_cle

# Quitter
EXIT
```	

### Surveiller Redis en temps réel

```bash
make redis-monitor
```
Affiche toutes les commandes exécutées sur Redis en temps réel.

### Vider Redis (⚠️ ATTENTION!)

```bash
make redis-flush
```
Supprime TOUTES les données de Redis (cache, tâches Celery, JWT blacklist).

---

## 🐳 Shell et Bash

### Django Shell

```bash
make shell
```

Exemples d'utilisation:
```python
# Tester une tâche Celery
from apps.users.tasks import send_otp_email_task
send_otp_email_task.delay('test@example.com', '123456', 'John')

# Créer un utilisateur
from apps.users.models import User
user = User.objects.create_user(email='test@test.com', password='pass123')

# Lister les utilisateurs
User.objects.all()
```

### Container Bash

```bash
make bash
```

Accède au shell Bash du container web Django.

---

## 🧪 Tests

```bash
# Lancer tous les tests
make test

# Tests spécifiques
docker compose exec web python manage.py test apps.users
```

---

## 🏭 Production

### Démarrer en production

```bash
# Construire les images de production
make prod-build

# Démarrer les services de production
make prod-up

# Voir les logs de production
make prod-logs
```

### Migrations en production

```bash
make prod-migrate
```

### Celery en production

```bash
# Logs Celery en production
make prod-celery-logs

# Redémarrer Celery en production
make prod-celery-restart

# Purger les tâches en production (⚠️ ATTENTION!)
make prod-celery-purge
```

### Health Check

```bash
# Vérifier l'état de tous les services
make health

# Production
make prod-health
```

Affiche:
- ✅ Docker containers en cours d'exécution
- ✅ Redis opérationnel (PING → PONG)
- ✅ PostgreSQL prêt
- ✅ Celery worker actif

---

## 🧹 Maintenance

### Nettoyer les tokens JWT expirés

```bash
# Développement
make jwt-cleanup

# Production
make prod-jwt-cleanup
```

Cette commande supprime les tokens JWT expirés de la base de données pour libérer de l'espace.

### Nettoyer Docker

```bash
# Supprimer containers et volumes
make clean

# Nettoyage complet de Docker (⚠️ ATTENTION!)
make prune
```

---

## 🎨 Exemples de workflows courants

### Workflow 1: Nouvelle feature

```bash
# 1. Créer des migrations
make makemigrations

# 2. Appliquer les migrations
make migrate

# 3. Tester les changements
make test

# 4. Voir les logs
make logs
```

### Workflow 2: Débugger Celery

```bash
# 1. Voir les logs du worker
make celery-logs

# 2. Inspecter les tâches actives
make celery-inspect

# 3. Voir les statistiques
make celery-stats

# 4. Accéder à Flower pour analyse visuelle
make flower
```

### Workflow 3: Problème Redis

```bash
# 1. Accéder au CLI Redis
make redis-cli

# 2. Vérifier la connexion
PING  # Doit retourner PONG

# 3. Voir les clés
KEYS *

# 4. Surveiller en temps réel
make redis-monitor
```

### Workflow 4: Déploiement production

```bash
# 1. Construire les images
make prod-build

# 2. Démarrer les services
make prod-up

# 3. Appliquer les migrations
make prod-migrate

# 4. Collecter les static files
make prod-collectstatic

# 5. Vérifier la santé
make prod-health

# 6. Surveiller les logs
make prod-logs
```

---

## 🔧 Personnalisation du Makefile

Vous pouvez ajouter vos propres commandes dans le Makefile:

```makefile
# Exemple: Commande personnalisée
my-command:
	@echo "Ma commande personnalisée"
	docker compose exec web python manage.py ma_commande

# Exemple: Seed database
seed-db:
	@echo "Seeding database with test data..."
	docker compose exec web python manage.py loaddata seed_data.json
	@echo "Database seeded!"
```

Puis l'utiliser:
```bash
make my-command
make seed-db
```

---

## 📊 Tableau récapitulatif

| Commande | Description | Usage |
|----------|-------------|-------|
| `make help` | Affiche l'aide | Toujours |
| `make up` | Démarre tous les services | Démarrage |
| `make down` | Arrête tous les services | Fin de journée |
| `make logs` | Voir tous les logs | Debugging |
| `make celery-logs` | Logs Celery | Debugging Celery |
| `make flower` | Ouvrir Flower | Monitoring Celery |
| `make redis-cli` | Accéder à Redis | Debugging Redis |
| `make shell` | Django shell | Tests rapides |
| `make migrate` | Appliquer migrations | Après changements DB |
| `make health` | Vérifier services | Diagnostic |
| `make clean` | Nettoyer containers | Nettoyage |

---

## ⚡ Tips & Tricks

### 1. Combiner des commandes

```bash
# Nettoyer + reconstruire + démarrer
make clean && make build && make up
```

### 2. Surveillance continue

```bash
# Terminal 1: Logs généraux
make logs

# Terminal 2: Logs Celery
make celery-logs

# Terminal 3: Flower
make flower
```

### 3. Démarrage rapide quotidien

```bash
# Matin
make up

# Soir
make down
```

### 4. Debugging rapide

```bash
# Voir toutes les tâches Celery en cours
make celery-inspect

# Voir les stats
make celery-stats

# Accéder au shell pour tests
make shell
```

---

## 🆘 Troubleshooting

### "make: command not found"

**Windows:** Installer Make via Chocolatey:
```bash
choco install make
```

**Linux/Mac:** Make est généralement déjà installé.

### Les commandes ne fonctionnent pas

Vérifier que vous êtes dans le bon répertoire:
```bash
pwd
# Devrait afficher: .../backendShoemaker
```

### "Service not found"

Vérifier que Docker est démarré et que les services sont up:
```bash
docker compose ps
```

---

**Auteur:** Shoemaker Backend Team
**Dernière mise à jour:** 2025-12-18

🎉 Utilisez le Makefile pour simplifier votre workflow de développement!
