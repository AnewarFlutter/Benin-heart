# Documentation API - Application de Rencontre

## Configuration de base

**Base URL:** `http://localhost:8000/api`

**Headers requis pour les routes protégées:**
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

---

## 🔐 Authentification

### 1. Inscription
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "date_of_birth": "1990-01-15",
  "gender": "male"
}
```

**Réponse attendue:**
```json
{
  "message": "Registration successful. Please verify your OTP.",
  "user": {...}
}
```

---

### 2. Vérifier l'OTP
```http
POST /auth/verify-otp
```

**Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Réponse attendue:**
```json
{
  "message": "OTP verified successfully",
  "token": "your-auth-token-here",
  "user": {...}
}
```

---

### 3. Renvoyer l'OTP
```http
POST /auth/resend-otp
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

---

### 4. Connexion
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse attendue:**
```json
{
  "token": "your-auth-token-here",
  "user": {...}
}
```

---

### 5. Mot de passe oublié
```http
POST /auth/forgot-password
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

---

### 6. Réinitialiser le mot de passe
```http
POST /auth/reset-password
```

**Body:**
```json
{
  "email": "john@example.com",
  "token": "reset-token",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

---

### 7. Déconnexion
```http
POST /auth/logout
Authorization: Bearer {token}
```

---

## 👤 Profil

### 1. Afficher le profil
```http
GET /profile
Authorization: Bearer {token}
```

---

### 2. Mettre à jour le profil
```http
PUT /profile
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Je suis passionné par...",
  "interests": ["sport", "musique", "voyage"],
  "location": "Paris, France",
  "gender": "male",
  "looking_for": "female"
}
```

---

## 📸 Photos

### 1. Lister les photos
```http
GET /photos
Authorization: Bearer {token}
```

---

### 2. Ajouter une photo
```http
POST /photos
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (FormData):**
```
photo: [file]
is_primary: true/false
```

---

### 3. Définir comme photo principale
```http
POST /photos/{photoId}/set-primary
Authorization: Bearer {token}
```

---

### 4. Supprimer une photo
```http
DELETE /photos/{photoId}
Authorization: Bearer {token}
```

---

## 🔍 Découverte

### 1. Découvrir des profils
```http
GET /discover
Authorization: Bearer {token}
```

**Query params (optionnels):**
```
?limit=10
&min_age=18
&max_age=35
&distance=50
&gender=female
```

---

## 👆 Swipes

### 1. Swiper sur un profil
```http
POST /swipes
Authorization: Bearer {token}
```

**Body:**
```json
{
  "to_user_id": 5,
  "direction": "right"
}
```
*Valeurs possibles pour `direction`: `"right"` (like), `"left"` (pass), `"super"` (super like)*

---

### 2. Historique des swipes
```http
GET /swipes/history
Authorization: Bearer {token}
```

**Query params:**
```
?limit=50
&direction=right
```

---

## 💖 Likes (Demandes de connexion)

### 1. Likes reçus
```http
GET /likes/received
Authorization: Bearer {token}
```

---

### 2. Likes envoyés
```http
GET /likes/sent
Authorization: Bearer {token}
```

---

### 3. Accepter un like
```http
POST /likes/{likeId}/accept
Authorization: Bearer {token}
```

---

### 4. Rejeter un like
```http
POST /likes/{likeId}/reject
Authorization: Bearer {token}
```

---

## 💑 Matches

### 1. Lister les matches
```http
GET /matches
Authorization: Bearer {token}
```

---

### 2. Afficher un match spécifique
```http
GET /matches/{matchId}
Authorization: Bearer {token}
```

---

### 3. Défaire un match (unmatch)
```http
DELETE /matches/{matchId}
Authorization: Bearer {token}
```

---

## 💬 Messages

### 1. Lister les messages d'un match
```http
GET /matches/{matchId}/messages
Authorization: Bearer {token}
```

**Query params:**
```
?limit=50
&offset=0
```

---

### 2. Envoyer un message
```http
POST /matches/{matchId}/messages
Authorization: Bearer {token}
```

**Body:**
```json
{
  "message_text": "Salut! Comment ça va?"
}
```

---

## 🚫 Blocages

### 1. Lister les utilisateurs bloqués
```http
GET /blocks
Authorization: Bearer {token}
```

---

### 2. Bloquer un utilisateur
```http
POST /blocks
Authorization: Bearer {token}
```

**Body:**
```json
{
  "blocked_user_id": 7,
  "reason": "Comportement inapproprié"
}
```

---

### 3. Débloquer un utilisateur
```http
DELETE /blocks/{blockedUserId}
Authorization: Bearer {token}
```

---

## 🚩 Signalements

### 1. Signaler un utilisateur
```http
POST /reports
Authorization: Bearer {token}
```

**Body:**
```json
{
  "reported_user_id": 8,
  "reason": "fake_profile",
  "description": "Ce profil utilise des photos de célébrités"
}
```

*Raisons possibles: `"fake_profile"`, `"inappropriate_content"`, `"harassment"`, `"spam"`, `"other"`*

---

### 2. Lister les signalements (Admin/Moderator)
```http
GET /reports
Authorization: Bearer {admin-token}
```

---

### 3. Mettre à jour le statut d'un signalement (Admin/Moderator)
```http
PUT /reports/{reportId}/status
Authorization: Bearer {admin-token}
```

**Body:**
```json
{
  "status": "reviewed",
  "notes": "Action taken: user warned"
}
```

*Statuts possibles: `"pending"`, `"reviewed"`, `"resolved"`, `"dismissed"`*

---

## 📝 Notes de test

### Ordre de test recommandé:

1. **Inscription et authentification**
   - Register → Verify OTP → Login
   - Sauvegarder le token reçu

2. **Configuration du profil**
   - Mettre à jour le profil
   - Ajouter des photos

3. **Découverte et interactions**
   - Découvrir des profils
   - Faire des swipes
   - Gérer les likes

4. **Matches et messages**
   - Vérifier les matches
   - Envoyer des messages

5. **Modération**
   - Tester les blocages
   - Tester les signalements

### Variables d'environnement suggérées:
```bash
BASE_URL=http://localhost:8000/api
TOKEN=your-auth-token-here
USER_ID=1
```

### Codes de statut HTTP attendus:
- `200` - Succès
- `201` - Créé avec succès
- `400` - Mauvaise requête
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Non trouvé
- `422` - Validation échouée
- `500` - Erreur serveur

---

## 🔧 Outils de test recommandés

- **Postman** - Interface graphique complète
- **Insomnia** - Alternative légère à Postman
- **cURL** - Ligne de commande
- **HTTPie** - cURL amélioré
- **Thunder Client** - Extension VS Code

### Exemple avec cURL:
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get profile (avec token)
curl -X GET http://localhost:8000/api/profile \
  -H "Authorization: Bearer your-token-here" \
  -H "Accept: application/json"
```

### Exemple avec HTTPie:
```bash
# Login
http POST http://localhost:8000/api/auth/login \
  email=john@example.com \
  password=password123

# Get profile (avec token)
http GET http://localhost:8000/api/profile \
  "Authorization: Bearer your-token-here"
```
