# Conventions de Code — Benin Heart

## Règles Communes (Backend + Frontend)

### 1. Toujours lire avant de modifier
Ne jamais modifier un fichier sans l'avoir lu en entier au préalable.

### 2. Clean Architecture — Ordre des dépendances
```
domain ← application ← infrastructure ← presentation
```
- `domain` : aucune dépendance externe
- `application` : dépend de `domain` uniquement
- `infrastructure` : implémente les interfaces de `domain`
- `presentation` : orchestre `application` + `infrastructure`

### 3. Ne jamais inventer
- Pas d'endpoints inventés
- Pas de champs de modèle inventés
- Toujours vérifier `api_mapping.md` avant de créer une nouvelle ressource

---

## Conventions Backend (Django)

### Nommage
| Element | Convention | Exemple |
|---------|-----------|---------|
| Apps | snake_case | `apps.storepage` |
| Modèles | PascalCase | `HeroBanner` |
| Serializers | PascalCase + suffixe | `HeroBannerSerializer` |
| ViewSets | PascalCase + suffixe | `AdminHeroBannerViewSet` |
| URLs | kebab-case | `hero-banners/` |
| Migrations | auto-générées | `0001_initial.py` |

### Structure des Réponses API
```json
// Liste
{ "count": N, "next": null, "previous": null, "results": [...] }

// Objet
{ "id": 1, "uuid": "...", "created_at": "...", "updated_at": "..." }

// Erreur
{ "detail": "Message d'erreur" }
```

### Permissions par Rôle
- `AllowAny` → endpoints publics (lecture storepage, FAQ, témoignages)
- `IsAuthenticated` → endpoints authentifiés
- `IsAdminOrSuperAdmin` → gestion admin
- `IsSuperAdmin` → gestion super admin

---

## Conventions Frontend (Next.js / TypeScript)

### Nommage
| Element | Convention | Exemple |
|---------|-----------|---------|
| Fichiers | snake_case | `model_stock.ts` |
| Classes | PascalCase | `ModelStock` |
| Interfaces | PascalCase | `EntityStock` |
| Méthodes | camelCase | `getAllStocks()` |
| Variables | camelCase | `stockList` |
| Constantes | UPPER_SNAKE | `API_ROUTES` |
| Composants | PascalCase | `StockTable.tsx` |

### Mapping API → TypeScript
| JSON (API) | TypeScript | Raison |
|-----------|-----------|--------|
| `created_at` | `createdAt` | camelCase convention |
| `updated_at` | `updatedAt` | camelCase convention |
| `is_active` | `isActive` | camelCase convention |
| `first_name` | `firstName` | camelCase convention |

### Tous les champs de modèle sont optionnels
```typescript
// Correct : supporte les payloads partiels
id?: string | null;
name?: string | null;
```

---

## Git

### Branches
- `main` : branche principale (stable)
- `anewar` : branche de développement actuelle

### Messages de commit
Format : `type: description courte en français`
Types : `feat`, `fix`, `refactor`, `docs`, `chore`

Exemple : `feat: ajouter l'app stock avec CRUD complet`
