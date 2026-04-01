# Makefile for Shoemaker API
.PHONY: help build up down logs shell migrate createsuperuser test clean

# Default target
help:
	@echo "Shoemaker API - Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  make build          - Build Docker images"
	@echo "  make up             - Start all services"
	@echo "  make down           - Stop all services"
	@echo "  make logs           - View logs"
	@echo "  make shell          - Access Django shell"
	@echo "  make bash           - Access container bash"
	@echo "  make migrate        - Run migrations"
	@echo "  make makemigrations - Create migrations"
	@echo "  make createsuperuser - Create Django superuser"
	@echo "  make test           - Run tests"
	@echo "  make collectstatic  - Collect static files"
	@echo ""
	@echo "Celery (Development):"
	@echo "  make celery-worker  - Start Celery worker (local)"
	@echo "  make celery-beat    - Start Celery beat (local)"
	@echo "  make celery-flower  - Start Flower monitoring (local)"
	@echo "  make celery-logs    - View Celery worker logs (Docker)"
	@echo "  make celery-restart - Restart Celery workers (Docker)"
	@echo "  make celery-purge   - Purge all Celery tasks"
	@echo "  make redis-cli      - Access Redis CLI"
	@echo "  make flower         - Open Flower in browser"
	@echo ""
	@echo "Production:"
	@echo "  make prod-build     - Build production images"
	@echo "  make prod-up        - Start production services"
	@echo "  make prod-down      - Stop production services"
	@echo "  make prod-logs      - View production logs"
	@echo "  make prod-migrate   - Run production migrations"
	@echo "  make prod-celery-logs - View production Celery logs"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean          - Remove containers and volumes"
	@echo "  make prune          - Clean Docker system"
	@echo "  make backup-db      - Backup database"
	@echo "  make restore-db     - Restore database"

# Development commands
build:
	docker compose build

up:
	docker compose up -d
	@echo "Services started! Access the API at http://localhost:8000"
	@echo "Admin: http://localhost:8000/admin (admin@admin.com / admin123)"
	@echo "pgAdmin: http://localhost:5050 (admin@admin.com / admin)"

down:
	docker compose down

logs:
	docker compose logs -f

shell:
	docker compose exec web python manage.py shell

bash:
	docker compose exec web bash

migrate:
	docker compose exec web python manage.py migrate

makemigrations:
	docker compose exec web python manage.py makemigrations

createsuperuser:
	docker compose exec web python manage.py createsuperuser

test:
	docker compose exec web python manage.py test

collectstatic:
	docker compose exec web python manage.py collectstatic --noinput

# Production commands
prod-build:
	docker compose -f docker-compose.prod.yml build

prod-up:
	docker compose -f docker-compose.prod.yml up -d
	@echo "Production services started!"

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

prod-migrate:
	docker compose -f docker-compose.prod.yml exec web python manage.py migrate

prod-collectstatic:
	docker compose -f docker-compose.prod.yml exec web python manage.py collectstatic --noinput

# Database commands
backup-db:
	@echo "Creating database backup..."
	docker compose exec db pg_dump -U postgres shoemaker_db > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup created!"

restore-db:
	@echo "Restoring database from backup..."
	@read -p "Enter backup file name: " backup; \
	docker compose exec -T db psql -U postgres shoemaker_db < $$backup
	@echo "Database restored!"

# Maintenance commands
clean:
	docker compose down -v
	@echo "Containers and volumes removed!"

prune:
	docker system prune -a --volumes
	@echo "Docker system cleaned!"

# Quick start (build + up)
start: build up
	@echo "Development environment started!"

# Quick stop and clean
stop: down clean
	@echo "Environment stopped and cleaned!"

# Restart services
restart: down up
	@echo "Services restarted!"

# Celery commands (local without Docker)
celery-worker:
	@echo "Starting Celery worker locally..."
	celery -A config worker --loglevel=info

celery-beat:
	@echo "Starting Celery beat locally..."
	celery -A config beat --loglevel=info

celery-flower:
	@echo "Starting Flower monitoring locally..."
	@echo "Access Flower at http://localhost:5555"
	celery -A config flower --port=5555

# Celery commands (Docker)
celery-logs:
	@echo "Viewing Celery worker logs..."
	docker compose logs -f celery_worker

celery-beat-logs:
	@echo "Viewing Celery beat logs..."
	docker compose logs -f celery_beat

celery-flower-logs:
	@echo "Viewing Flower logs..."
	docker compose logs -f flower

celery-restart:
	@echo "Restarting Celery workers..."
	docker compose restart celery_worker celery_beat

celery-purge:
	@echo "⚠️  WARNING: This will delete all pending Celery tasks!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose exec celery_worker celery -A config purge -f
	@echo "All tasks purged!"

celery-inspect:
	@echo "Inspecting active Celery tasks..."
	docker compose exec celery_worker celery -A config inspect active

celery-stats:
	@echo "Celery worker statistics..."
	docker compose exec celery_worker celery -A config inspect stats

# Redis commands
redis-cli:
	@echo "Accessing Redis CLI..."
	docker compose exec redis redis-cli

redis-monitor:
	@echo "Monitoring Redis commands (Ctrl+C to stop)..."
	docker compose exec redis redis-cli monitor

redis-flush:
	@echo "⚠️  WARNING: This will flush all Redis data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose exec redis redis-cli FLUSHALL
	@echo "Redis flushed!"

# Flower browser shortcut
flower:
	@echo "Opening Flower in browser..."
	@python -m webbrowser http://localhost:5555 || xdg-open http://localhost:5555 || open http://localhost:5555

# Production Celery commands
prod-celery-logs:
	docker compose -f docker-compose.prod.yml logs -f celery_worker

prod-celery-restart:
	docker compose -f docker-compose.prod.yml restart celery_worker celery_beat

prod-celery-purge:
	@echo "⚠️  WARNING: This will delete all pending Celery tasks in PRODUCTION!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose -f docker-compose.prod.yml exec celery_worker celery -A config purge -f
	@echo "All production tasks purged!"

# JWT Token cleanup (useful maintenance)
jwt-cleanup:
	@echo "Cleaning up expired JWT tokens..."
	docker compose exec web python manage.py flushexpiredtokens
	@echo "Expired tokens cleaned!"

prod-jwt-cleanup:
	@echo "Cleaning up expired JWT tokens (PRODUCTION)..."
	docker compose -f docker-compose.prod.yml exec web python manage.py flushexpiredtokens
	@echo "Expired tokens cleaned!"

# Health check
health:
	@echo "Checking service health..."
	@echo "\n📊 Docker Containers:"
	@docker compose ps
	@echo "\n🔴 Redis:"
	@docker compose exec redis redis-cli ping || echo "❌ Redis not responding"
	@echo "\n🐘 PostgreSQL:"
	@docker compose exec db pg_isready -U postgres || echo "❌ PostgreSQL not responding"
	@echo "\n⚙️  Celery Worker:"
	@docker compose exec celery_worker celery -A config inspect ping || echo "❌ Celery not responding"
	@echo "\n✅ Health check complete!"

prod-health:
	@echo "Checking PRODUCTION service health..."
	@docker compose -f docker-compose.prod.yml ps
	@docker compose -f docker-compose.prod.yml exec redis redis-cli ping || echo "❌ Redis not responding"
	@docker compose -f docker-compose.prod.yml exec db pg_isready -U postgres || echo "❌ PostgreSQL not responding"
	@docker compose -f docker-compose.prod.yml exec celery_worker celery -A config inspect ping || echo "❌ Celery not responding"
