# 📚 Guide Celery pour Débutants - Shoemaker

## 🎯 Qu'est-ce que Celery ?

**Celery** est un système de **file d'attente de tâches** (task queue) qui permet d'exécuter des opérations **en arrière-plan** de manière **asynchrone**.

### Pourquoi utiliser Celery ?

Sans Celery (synchrone) ❌:
```
User fait une action → Django envoie email → User attend ⏳ → User reçoit réponse (lent!)
```

Avec Celery (asynchrone) ✅:
```
User fait une action → Django met email en queue → User reçoit réponse immédiatement! ⚡
                     ↓
                   Celery envoie email en arrière-plan 🚀
```

### Cas d'utilisation courants

- ✉️ **Envoi d'emails** (OTP, confirmation, newsletters)
- 📊 **Génération de rapports**
- 🖼️ **Traitement d'images** (resize, compression)
- 📁 **Export de données** (CSV, PDF)
- 🔔 **Notifications push**
- 🧹 **Tâches de nettoyage** (suppression de fichiers temporaires)
- 📈 **Calculs lourds**

---

## 🏗️ Architecture Celery dans Shoemaker

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE CELERY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  1. Appel API    ┌────────────┐                  │
│  │  Client  │ ───────────────> │   Django   │                  │
│  │ (React)  │                   │   (API)    │                  │
│  └──────────┘                   └────────────┘                  │
│                                        │                         │
│                                        │ 2. Créer tâche          │
│                                        ↓                         │
│                                 ┌─────────────┐                 │
│                                 │    Redis    │                 │
│                                 │  (Broker)   │                 │
│                                 └─────────────┘                 │
│                                        │                         │
│                                        │ 3. Récupérer tâche      │
│                                        ↓                         │
│                                 ┌─────────────┐                 │
│                                 │   Celery    │                 │
│                                 │   Worker    │                 │
│                                 └─────────────┘                 │
│                                        │                         │
│                                        │ 4. Exécuter tâche       │
│                                        ↓                         │
│                                 ┌─────────────┐                 │
│                                 │ Envoi Email │                 │
│                                 │  (SMTP)     │                 │
│                                 └─────────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Composants

1. **Django (Producer)**: Crée les tâches et les envoie à Redis
2. **Redis (Broker)**: Stocke les tâches en attente (queue)
3. **Celery Worker (Consumer)**: Récupère et exécute les tâches
4. **Celery Beat (Scheduler)**: Programme des tâches périodiques (optionnel)
5. **Flower (Monitoring)**: Interface web pour surveiller Celery (optionnel)

---

## 📦 Installation et Configuration

### 1. Installation des dépendances

```bash
pip install celery redis flower
```

### 2. Structure des fichiers

```
backendShoemaker/
├── config/
│   ├── celery.py          # Configuration Celery ⭐
│   ├── __init__.py        # Import Celery au démarrage
│   └── settings/
│       └── base.py        # Settings Django + Celery
├── apps/
│   └── users/
│       └── tasks.py       # Tâches Celery pour Users ⭐
├── templates/
│   └── emails/            # Templates HTML des emails ⭐
│       ├── otp_verification.html
│       ├── password_reset.html
│       ├── welcome.html
│       └── password_reset_confirmation.html
└── docker-compose.yml     # Services Docker (Redis, Celery, etc.)
```

### 3. Configuration dans `.env`

```env
# Redis (Broker & Backend)
REDIS_HOST=localhost
REDIS_PORT=6379
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre_email@gmail.com
EMAIL_HOST_PASSWORD=votre_mot_de_passe_app
DEFAULT_FROM_EMAIL=noreply@shoemaker.com
```

---

## 🚀 Démarrage rapide

### Option 1: Avec Docker (Recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Services démarrés:
# - db (PostgreSQL)
# - redis
# - celery_worker
# - celery_beat
# - flower (http://localhost:5555)
```

### Option 2: Sans Docker (Local)

Terminal 1 - Django:
```bash
python manage.py runserver
```

Terminal 2 - Redis:
```bash
redis-server
```

Terminal 3 - Celery Worker:
```bash
celery -A config worker --loglevel=info
```

Terminal 4 - Celery Beat (optionnel):
```bash
celery -A config beat --loglevel=info
```

Terminal 5 - Flower (optionnel):
```bash
celery -A config flower --port=5555
```

---

## ✍️ Comment créer une nouvelle tâche Celery

### Exemple 1: Email de formulaire de contact (DÉBUTANT)

#### **Étape 1: Créer le template HTML**

`templates/emails/contact_form.html`:
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
        }
        .content {
            padding: 20px 0;
            color: #333;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 Nouveau message de contact</h1>
        </div>
        <div class="content">
            <p><strong>Vous avez reçu un nouveau message depuis le formulaire de contact:</strong></p>

            <div class="info-box">
                <p><strong>De:</strong> {{name}}</p>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Téléphone:</strong> {{phone}}</p>
            </div>

            <div class="info-box">
                <p><strong>Message:</strong></p>
                <p>{{message}}</p>
            </div>

            <p><em>Envoyé le: {{date}}</em></p>
        </div>
    </div>
</body>
</html>
```

#### **Étape 2: Créer la tâche Celery**

`apps/contact/tasks.py` (créer ce fichier):
```python
"""
Tâches Celery pour le module Contact.
"""
from celery import shared_task
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_contact_form_email_task(self, name, email, phone, message, admin_email=None):
    """
    Tâche asynchrone pour envoyer un email depuis le formulaire de contact.

    Args:
        name (str): Nom de la personne
        email (str): Email de la personne
        phone (str): Téléphone de la personne
        message (str): Message envoyé
        admin_email (str): Email de l'admin qui recevra le message

    Returns:
        dict: Résultat de l'envoi
    """
    try:
        # Email de destination (admin)
        recipient_email = admin_email or settings.DEFAULT_FROM_EMAIL

        # Contexte pour le template
        context = {
            'name': name,
            'email': email,
            'phone': phone,
            'message': message,
            'date': datetime.now().strftime('%d/%m/%Y à %H:%M'),
        }

        # Rendre le template HTML
        html_content = render_to_string('emails/contact_form.html', context)

        # Créer l'email
        email_message = EmailMessage(
            subject=f'Nouveau message de contact - {name}',
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email],
            reply_to=[email],  # Permet de répondre directement à la personne
        )
        email_message.content_subtype = 'html'

        # Envoyer l'email
        email_message.send(fail_silently=False)

        logger.info(f"✅ Email de contact envoyé depuis {email} vers {recipient_email}")
        return {
            'status': 'success',
            'from': email,
            'to': recipient_email,
            'message': 'Email envoyé avec succès'
        }

    except Exception as exc:
        logger.error(f"❌ Erreur lors de l'envoi de l'email de contact: {exc}")

        # Réessayer la tâche en cas d'erreur
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error(f"❌ Nombre maximum de tentatives atteint pour {email}")
            return {
                'status': 'failed',
                'error': str(exc)
            }


@shared_task
def send_contact_confirmation_email_task(email, name):
    """
    Tâche pour envoyer un email de confirmation à la personne qui a envoyé le formulaire.

    Args:
        email (str): Email de la personne
        name (str): Nom de la personne
    """
    try:
        subject = 'Nous avons bien reçu votre message - Shoemaker'

        # Message simple (ou créer un template dédié)
        html_content = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✉️ Message bien reçu!</h1>
        </div>
        <div style="padding: 20px 0; color: #333;">
            <p>Bonjour <strong>{name}</strong>,</p>
            <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contacté.</p>
            <p>Notre équipe vous répondra dans les plus brefs délais.</p>
            <p>Cordialement,<br><strong>L'équipe Shoemaker</strong></p>
        </div>
    </div>
</body>
</html>
        """

        email_message = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        email_message.content_subtype = 'html'
        email_message.send(fail_silently=False)

        logger.info(f"✅ Email de confirmation envoyé à {email}")
        return {'status': 'success', 'email': email}

    except Exception as exc:
        logger.error(f"❌ Erreur lors de l'envoi de la confirmation: {exc}")
        return {'status': 'failed', 'error': str(exc)}
```

#### **Étape 3: Utiliser la tâche dans votre view**

`apps/contact/views.py`:
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .tasks import send_contact_form_email_task, send_contact_confirmation_email_task


@api_view(['POST'])
def contact_form_view(request):
    """
    API pour recevoir les messages du formulaire de contact.

    POST /api/contact/
    Body: {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+33612345678",
        "message": "Bonjour, j'ai une question..."
    }
    """
    # Récupérer les données
    name = request.data.get('name')
    email = request.data.get('email')
    phone = request.data.get('phone')
    message = request.data.get('message')

    # Validation simple
    if not all([name, email, message]):
        return Response(
            {'error': 'Name, email et message sont requis'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ✨ ENVOYER LES EMAILS EN ASYNCHRONE avec Celery
    # Email vers l'admin
    send_contact_form_email_task.delay(
        name=name,
        email=email,
        phone=phone or 'Non fourni',
        message=message,
        admin_email='admin@shoemaker.com'  # ou settings.CONTACT_EMAIL
    )

    # Email de confirmation vers l'utilisateur
    send_contact_confirmation_email_task.delay(
        email=email,
        name=name
    )

    # ⚡ Réponse IMMÉDIATE à l'utilisateur (sans attendre l'envoi des emails)
    return Response({
        'message': 'Votre message a été envoyé avec succès. Nous vous répondrons rapidement.',
        'status': 'success'
    }, status=status.HTTP_200_OK)
```

#### **Étape 4: Ajouter la route**

`apps/contact/urls.py`:
```python
from django.urls import path
from .views import contact_form_view

urlpatterns = [
    path('', contact_form_view, name='contact-form'),
]
```

`config/urls.py`:
```python
urlpatterns = [
    # ...
    path('api/contact/', include('apps.contact.urls')),
]
```

---

## 🧪 Comment tester vos tâches Celery

### Test 1: Depuis le shell Django

```bash
python manage.py shell
```

```python
# Importer la tâche
from apps.contact.tasks import send_contact_form_email_task

# Tester l'envoi
result = send_contact_form_email_task.delay(
    name='Test User',
    email='test@example.com',
    phone='+33612345678',
    message='Ceci est un test!',
    admin_email='admin@shoemaker.com'
)

# Vérifier le statut
print(f"Task ID: {result.id}")
print(f"Status: {result.status}")

# Attendre le résultat (bloquant)
print(result.get(timeout=10))
```

### Test 2: Depuis l'API (Postman/cURL)

```bash
curl -X POST http://localhost:8000/api/contact/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+33612345678",
    "message": "Bonjour, je voudrais des informations sur vos services."
  }'
```

Réponse attendue (IMMÉDIATE):
```json
{
  "message": "Votre message a été envoyé avec succès. Nous vous répondrons rapidement.",
  "status": "success"
}
```

### Test 3: Vérifier les logs Celery

Dans le terminal où Celery Worker tourne:
```
[2025-12-18 14:30:15,123: INFO/MainProcess] Task apps.contact.tasks.send_contact_form_email_task[abc123] received
[2025-12-18 14:30:15,456: INFO/ForkPoolWorker-1] ✅ Email de contact envoyé depuis john@example.com vers admin@shoemaker.com
[2025-12-18 14:30:15,789: INFO/ForkPoolWorker-1] Task apps.contact.tasks.send_contact_form_email_task[abc123] succeeded
```

---

## 📊 Monitoring avec Flower

Flower est une interface web pour surveiller vos tâches Celery en temps réel.

### Accéder à Flower

```
http://localhost:5555
```

### Fonctionnalités

- ✅ **Dashboard**: Vue d'ensemble des tâches
- 📋 **Tasks**: Liste de toutes les tâches (en cours, réussies, échouées)
- 🔍 **Task Details**: Détails d'une tâche spécifique (arguments, résultat, durée)
- 📈 **Monitor**: Graphiques en temps réel
- ⚙️ **Workers**: Statut des workers Celery

---

## 🎨 Autres exemples de tâches

### Exemple 2: Newsletter (emails groupés)

`apps/newsletter/tasks.py`:
```python
from celery import shared_task
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from apps.users.models import User


@shared_task
def send_newsletter_task(subject, template_name, context_data):
    """
    Envoyer une newsletter à tous les utilisateurs vérifiés.
    """
    # Récupérer tous les utilisateurs vérifiés
    users = User.objects.filter(is_verified=True, is_active=True)

    sent_count = 0
    failed_count = 0

    for user in users:
        try:
            context = {
                'user_name': user.first_name,
                **context_data  # Ajouter les données supplémentaires
            }

            html_content = render_to_string(template_name, context)

            email = EmailMessage(
                subject=subject,
                body=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            email.content_subtype = 'html'
            email.send()

            sent_count += 1

        except Exception as e:
            failed_count += 1
            logger.error(f"Erreur envoi newsletter à {user.email}: {e}")

    return {
        'total': users.count(),
        'sent': sent_count,
        'failed': failed_count
    }
```

### Exemple 3: Génération de rapport PDF

`apps/reports/tasks.py`:
```python
from celery import shared_task
from django.core.mail import EmailMessage
from reportlab.pdfgen import canvas
import io


@shared_task
def generate_monthly_report_task(user_id, month, year):
    """
    Générer un rapport mensuel en PDF et l'envoyer par email.
    """
    from apps.users.models import User

    user = User.objects.get(id=user_id)

    # Créer le PDF
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer)
    pdf.drawString(100, 750, f"Rapport mensuel - {month}/{year}")
    pdf.drawString(100, 730, f"Utilisateur: {user.full_name}")
    # ... ajouter plus de contenu
    pdf.save()

    # Récupérer le contenu du PDF
    buffer.seek(0)
    pdf_content = buffer.read()

    # Envoyer par email
    email = EmailMessage(
        subject=f'Votre rapport mensuel - {month}/{year}',
        body='Veuillez trouver ci-joint votre rapport mensuel.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach(f'rapport_{month}_{year}.pdf', pdf_content, 'application/pdf')
    email.send()

    return {'status': 'success', 'user_id': user_id}
```

---

## 🔧 Tâches périodiques avec Celery Beat

Pour exécuter des tâches automatiquement à intervalle régulier.

### Configuration dans `config/celery.py`

```python
from celery.schedules import crontab

app.conf.beat_schedule = {
    # Nettoyer les tokens expirés tous les jours à minuit
    'cleanup-expired-tokens': {
        'task': 'apps.users.tasks.cleanup_expired_tokens_task',
        'schedule': crontab(hour=0, minute=0),
    },

    # Envoyer un email de rappel tous les lundis à 9h
    'weekly-reminder': {
        'task': 'apps.notifications.tasks.send_weekly_reminder_task',
        'schedule': crontab(hour=9, minute=0, day_of_week=1),
    },

    # Générer des statistiques toutes les heures
    'hourly-stats': {
        'task': 'apps.analytics.tasks.generate_hourly_stats_task',
        'schedule': crontab(minute=0),  # Toutes les heures
    },
}
```

### Créer la tâche

`apps/users/tasks.py`:
```python
@shared_task
def cleanup_expired_tokens_task():
    """
    Nettoyer les tokens JWT expirés de la base de données.
    Exécuté automatiquement tous les jours à minuit.
    """
    from django.utils import timezone
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

    # Supprimer les tokens expirés
    expired_tokens = OutstandingToken.objects.filter(
        expires_at__lt=timezone.now()
    )
    count = expired_tokens.count()
    expired_tokens.delete()

    logger.info(f"🧹 {count} tokens expirés nettoyés")
    return {'deleted': count}
```

---

## ❗ Troubleshooting (Résolution de problèmes)

### Problème 1: "Connection refused" à Redis

**Erreur**:
```
celery.exceptions.ImproperlyConfigured: Cannot connect to redis://localhost:6379/1
```

**Solution**:
```bash
# Vérifier si Redis tourne
redis-cli ping
# Devrait retourner: PONG

# Si non, démarrer Redis
# Docker:
docker-compose up -d redis

# Local:
redis-server
```

### Problème 2: Les tâches ne s'exécutent pas

**Vérification**:
1. Redis est-il démarré ? → `redis-cli ping`
2. Celery Worker est-il démarré ? → Vérifier les logs
3. La tâche est-elle bien décorée avec `@shared_task` ?

**Solution**:
```bash
# Relancer le worker avec verbose
celery -A config worker --loglevel=debug
```

### Problème 3: Emails ne sont pas envoyés

**Vérification**:
1. Variables EMAIL_* dans `.env` sont correctes ?
2. Si Gmail: Avez-vous activé "Accès applications moins sécurisées" ou créé un "Mot de passe d'application" ?
3. Les logs Celery montrent-ils une erreur ?

**Solution**:
```bash
# Tester l'envoi d'email depuis Django shell
python manage.py shell

from django.core.mail import send_mail
send_mail(
    'Test',
    'Message de test',
    'from@example.com',
    ['to@example.com'],
    fail_silently=False,
)
```

### Problème 4: Tâche échoue sans erreur claire

**Solution**:
```python
# Ajouter plus de logging dans votre tâche
import logging
logger = logging.getLogger(__name__)

@shared_task
def ma_tache():
    try:
        logger.info("Début de la tâche")
        # ... code
        logger.info("Fin de la tâche")
    except Exception as e:
        logger.error(f"Erreur: {e}", exc_info=True)
        raise
```

---

## ✅ Checklist avant déploiement en production

- [ ] Redis est sécurisé avec un mot de passe (`REDIS_PASSWORD`)
- [ ] Les variables sensibles sont dans `.env` (pas dans le code)
- [ ] Celery Worker et Beat sont configurés pour redémarrer automatiquement
- [ ] Les emails ont un rate limiting (éviter le spam)
- [ ] Les tâches ont un `max_retries` et `default_retry_delay`
- [ ] Les logs sont centralisés (Sentry, CloudWatch, etc.)
- [ ] Flower est protégé par authentification en production
- [ ] Les templates HTML sont testés sur plusieurs clients email

---

## 📚 Ressources supplémentaires

- 📖 [Documentation officielle Celery](https://docs.celeryproject.org/)
- 🎥 [Tutoriel vidéo Celery + Django](https://www.youtube.com/results?search_query=celery+django+tutorial)
- 💬 [Forum Celery](https://groups.google.com/g/celery-users)
- 🐛 [Issues GitHub Celery](https://github.com/celery/celery/issues)

---

## 🎓 Récapitulatif pour débutants

### Pour envoyer un email asynchrone:

1. **Créer un template HTML** dans `templates/emails/`
2. **Créer une tâche Celery** dans `apps/votre_app/tasks.py`:
   ```python
   @shared_task
   def send_my_email_task(email, name):
       html_content = render_to_string('emails/my_template.html', {'name': name})
       # ... envoyer email
   ```
3. **Appeler la tâche depuis votre view**:
   ```python
   from .tasks import send_my_email_task

   send_my_email_task.delay(email='user@example.com', name='John')
   ```
4. **C'est tout!** L'email sera envoyé en arrière-plan ⚡

### Commandes utiles

```bash
# Démarrer Celery Worker
celery -A config worker --loglevel=info

# Démarrer Celery Beat
celery -A config beat --loglevel=info

# Démarrer Flower (monitoring)
celery -A config flower --port=5555

# Tester depuis le shell
python manage.py shell
from apps.users.tasks import send_otp_email_task
send_otp_email_task.delay('test@example.com', '123456', 'John')

# Voir les tâches en attente dans Redis
redis-cli
LLEN celery  # Nombre de tâches en queue
```

---

**Auteur:** Shoemaker Backend Team
**Dernière mise à jour:** 2025-12-18

🎉 Félicitations! Vous savez maintenant utiliser Celery pour envoyer des emails asynchrones!
