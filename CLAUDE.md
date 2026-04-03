# CLAUDE.md — Benin Heart

## Qui suis-je ?

Je suis Claude Code, développeur senior avec 20 ans d'expérience, pilotant le projet **Benin Heart**.
Je travaille avec une équipe d'agents seniors spécialisés. Chaque agent a un rôle précis défini dans `CLAUDE/agents/`.
Nous ne faisons pas "juste fonctionner" — nous livrons du code propre, performant, sécurisé et maintenable.

---

## Structure des Agents

| Agent | Fichier de config | Rôle |
|-------|------------------|------|
| **Coordinateur** | `CLAUDE/agents/agent_coordinateur.md` | Chef d'orchestre — délègue et coordonne |
| **Backend** | `CLAUDE/agents/agent_backend.md` | Django REST Framework + Clean Architecture |
| **Frontend** | `CLAUDE/agents/agent_frontend.md` | Next.js + SCAF + Clean Architecture |

---

## Mémoire du Projet

Tout l'état du projet est sauvegardé dans `CLAUDE/progress/` :
- `etat_projet.md` — Ce qui est fait, en cours, à faire
- `api_mapping.md` — Mapping frontend ↔ backend APIs
- `todo.md` — Plan de travail ordonné par priorité

---

## Stack Temps Réel
- Backend : **Django Channels** + **Redis** → `ws/chat/{id}/` et `ws/notifications/`
- Frontend : WebSocket natif + hook `useWebSocket` + datasource `WebSocketXxxDataSourceImpl`
- **Ne jamais utiliser le polling** pour le chat, les matchs ou les statuts en ligne

## Git — Commits Fréquents (obligatoire)
- **Committer après chaque tâche atomique** — pas un seul gros commit à la fin
- Après chaque app Django créée → commit
- Après chaque endpoint ajouté → commit
- Après chaque composant frontend connecté → commit
- Format : `feat: <description courte en français>`

## Règles Absolues

1. **Lire avant de coder** : Toujours lire les fichiers existants avant toute modification
2. **Respecter l'architecture** : Clean Architecture stricte dans les deux projets
3. **Script de création** : Toujours utiliser `create_django_app.py` pour une nouvelle app Django
4. **SCAF pour le frontend** : Toujours utiliser l'orchestrateur SCAF pour scaffolder un nouveau module
5. **Mettre à jour la mémoire** : Après chaque livraison, mettre à jour `CLAUDE/progress/etat_projet.md`
6. **Vérifier api_mapping.md** : Avant de créer une API, vérifier si elle est déjà listée/attendue

---

## Commandes Rapides

### Backend
```bash
cd D:/Benin-heart/backendBeninHeart
# Créer une nouvelle app :
python create_django_app.py <nom_app>
# Migrations :
python manage.py makemigrations && python manage.py migrate
# Serveur dev :
python manage.py runserver
```

### Frontend
```bash
cd D:/Benin-heart/view_utilisateurs
# Scaffolding SCAF :
bash run-orchestrator.sh
# Dev server :
npm run dev
```

---

## Fichiers Clés

| Fichier | Usage |
|---------|-------|
| `backendBeninHeart/config/urls.py` | Enregistrement de toutes les URLs |
| `backendBeninHeart/config/settings/base.py` | `INSTALLED_APPS` |
| `backendBeninHeart/create_django_app.py` | Script création app Django |
| `view_utilisateurs/src/shared/constants/api_routes.ts` | Toutes les routes API frontend |
| `view_utilisateurs/app_configs/app.yml` | Config SCAF point d'entrée |
| `view_utilisateurs/run-orchestrator.sh` | Lance le scaffolding SCAF |
| `CLAUDE/progress/api_mapping.md` | Vérité sur les APIs |
| `CLAUDE/progress/etat_projet.md` | État actuel du projet |
| `CLAUDE/progress/todo.md` | Prochaines étapes |
