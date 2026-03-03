# 🚀 Celery - Démarrage Rapide

## ✅ Ce qui a été fait

### 1. **Configuration Celery**
- ✅ `config/celery.py` - Configuration Celery
- ✅ `config/__init__.py` - Auto-import de Celery
- ✅ `config/settings/base.py` - Settings Celery ajoutés

### 2. **Tâches Celery créées**
- ✅ `apps/users/tasks.py` - Tâches d'envoi d'emails:
  - `send_otp_email_task()` - Email OTP avec template
  - `send_welcome_email_task()` - Email de bienvenue
  - `send_password_reset_confirmation_email_task()` - Confirmation reset

### 3. **Templates HTML créés**
- ✅ `templates/emails/otp_verification.html`
- ✅ `templates/emails/password_reset.html`
- ✅ `templates/emails/welcome.html`
- ✅ `templates/emails/password_reset_confirmation.html`

### 4. **Docker configuré**
- ✅ `docker-compose.yml` - Services ajoutés:
  - `celery_worker` - Worker Celery
  - `celery_beat` - Tâches périodiques
  - `flower` - Monitoring (http://localhost:5555)

### 5. **Service OTPService modifié**
- ✅ `apps/users/domain/services.py` - Utilise maintenant Celery asynchrone

### 6. **Variables d'environnement**
- ✅ `.env` et `.env.example` - Variables Celery ajoutées

---

## 🏃 Démarrer Celery

### Avec Docker (Recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Services disponibles:
# - Redis: localhost:6379
# - Celery Worker: en arrière-plan
# - Celery Beat: en arrière-plan
# - Flower: http://localhost:5555
```

### Sans Docker (Local)

**Terminal 1 - Redis:**
```bash
redis-server
```

**Terminal 2 - Django:**
```bash
python manage.py runserver
```

**Terminal 3 - Celery Worker:**
```bash
celery -A config worker --loglevel=info
```

**Terminal 4 - Flower (optionnel):**
```bash
celery -A config flower --port=5555
```

---

## 📧 Tester l'envoi d'email asynchrone

### Test 1: Inscription (déjà configuré)

```bash
# Faire une inscription via l'API
curl -X POST http://localhost:8000/api/client/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+33612345678",
    "role": "CLIENT"
  }'
```

✅ **L'email OTP sera envoyé en arrière-plan par Celery!**

### Test 2: Depuis le shell

```bash
python manage.py shell
```

```python
from apps.users.tasks import send_otp_email_task

# Envoyer un email OTP
result = send_otp_email_task.delay(
    email='test@example.com',
    otp_code='123456',
    user_name='John Doe',
    is_password_reset=False
)

print(f"Task ID: {result.id}")
print(f"Status: {result.status}")
```

---

## 🌸 Flower - Monitoring

Accédez à Flower pour surveiller vos tâches:

```
http://localhost:5555
```

Fonctionnalités:
- 📊 Dashboard des tâches
- ✅ Tâches réussies
- ❌ Tâches échouées
- ⏱️ Temps d'exécution
- 📈 Graphiques en temps réel

---

## 🎯 Créer une nouvelle tâche (Exemple: Contact Form)

### 1. Créer le template

`templates/emails/contact_form.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Nouveau message de contact</h1>
    <p><strong>De:</strong> {{name}} ({{email}})</p>
    <p><strong>Message:</strong></p>
    <p>{{message}}</p>
</body>
</html>
```

### 2. Créer la tâche

`apps/contact/tasks.py`:
```python
from celery import shared_task
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings


@shared_task
def send_contact_email_task(name, email, message):
    html = render_to_string('emails/contact_form.html', {
        'name': name,
        'email': email,
        'message': message
    })

    email_msg = EmailMessage(
        subject=f'Contact - {name}',
        body=html,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=['admin@shoemaker.com'],
    )
    email_msg.content_subtype = 'html'
    email_msg.send()
```

### 3. Utiliser dans la view

```python
from .tasks import send_contact_email_task

@api_view(['POST'])
def contact_view(request):
    name = request.data['name']
    email = request.data['email']
    message = request.data['message']

    # Envoi asynchrone
    send_contact_email_task.delay(name, email, message)

    return Response({'message': 'Email envoyé!'})
```

---

## 🔍 Vérifier que Celery fonctionne

### 1. Redis est-il démarré?

```bash
redis-cli ping
# Doit retourner: PONG
```

### 2. Celery Worker est-il actif?

```bash
celery -A config inspect active
```

### 3. Voir les logs en temps réel

```bash
# Dans le terminal du Celery Worker
celery -A config worker --loglevel=debug
```

Vous devriez voir:
```
[2025-12-18 14:30:15,123: INFO/MainProcess] celery@hostname ready.
[2025-12-18 14:30:20,456: INFO/MainProcess] Task apps.users.tasks.send_otp_email_task[abc] received
[2025-12-18 14:30:21,789: INFO/ForkPoolWorker-1] ✅ OTP email envoyé avec succès
[2025-12-18 14:30:21,999: INFO/ForkPoolWorker-1] Task succeeded
```

---

## ⚠️ Problèmes courants

### ❌ "Connection refused" à Redis

```bash
# Vérifier
docker ps | grep redis

# Démarrer Redis
docker-compose up -d redis
```

### ❌ Les emails ne partent pas

1. Vérifier les variables EMAIL_* dans `.env`
2. Si Gmail: Créer un "Mot de passe d'application"
3. Vérifier les logs Celery pour les erreurs

### ❌ Tâche reste "PENDING"

- Celery Worker n'est pas démarré
- Redis n'est pas accessible
- Nom de la tâche incorrect

---

## 📝 Checklist de déploiement

- [ ] Redis démarré et accessible
- [ ] Celery Worker démarré
- [ ] Variables EMAIL_* configurées
- [ ] Templates HTML testés
- [ ] Logs Celery surveillés
- [ ] Flower accessible (pour monitoring)

---

## 📚 Documentation complète

Pour un guide détaillé avec plus d'exemples:
👉 **`CELERY_GUIDE_DEBUTANT.md`**

---

**Prêt à utiliser Celery!** 🎉

L'envoi d'emails est maintenant **asynchrone** et n'impacte plus les performances de votre API! ⚡
