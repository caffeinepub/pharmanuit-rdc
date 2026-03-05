# PharmaNuit RDC

## Current State

Backend Motoko généré avec les modèles User et Pharmacie, les APIs publiques, pharmacy owner et admin. Frontend pas encore construit.

## Requested Changes (Diff)

### Add

**Backend (Motoko):**
- Model `User`: id, nom, email, mot_de_passe (hashed), role (user/pharmacy/admin), statut_compte (actif/en_attente/suspendu)
- Model `Pharmacy`: id, nom_pharmacie, commune, adresse, telephone, horaires, statut_ouvert (Bool), valide_par_admin (Bool), nombre_vues (Nat), user_id (owner link)
- Auth: register (pharmacy role → statut_compte = en_attente), login (session token), get current user
- Public queries: list validated pharmacies, get pharmacy detail (+ increment nombre_vues)
- Pharmacy owner APIs: update horaires/telephone/adresse/statut_ouvert, get own pharmacy stats
- Admin APIs: list all pharmacies, validate/reject pharmacy (valide_par_admin), list all pharmacy accounts, activate/suspend account (statut_compte), add pharmacy manually

**Frontend (React + TypeScript):**
- Public page: list of validated pharmacies with nom_pharmacie, commune, statut_ouvert badge
- Pharmacy detail page: 4 action buttons (Appeler, Voir le numéro, Voir l'adresse, Itinéraire via maps.google.com)
- Login page (shared, role-based redirect)
- Pharmacy dashboard: nombre_vues stat, en_attente notice, edit form
- Admin dashboard (interface cachée):
  - Liste de toutes les pharmacies avec statut de validation
  - Valider / refuser / suspendre une pharmacie (valide_par_admin)
  - Modifier les informations d'une pharmacie (nom, commune, adresse, telephone, horaires, statut_ouvert)
  - Supprimer une pharmacie
  - Liste des comptes pharmacie avec statut_compte, activer/suspendre
  - Ajouter une pharmacie manuellement
  - Statistiques simples: nombre total de pharmacies, nombre total de vues
- Page Conditions d'utilisation (route /conditions):
  - L'application fournit uniquement des informations
  - Elle ne vend pas de médicaments
  - Les horaires sont déclarés par les pharmacies elles-mêmes
  - Chaque utilisateur est responsable de ses déplacements
  - L'application ne garantit pas la sécurité des lieux

### Modify

Nothing (new project).

### Remove

Nothing (new project).

## Implementation Plan

1. Select `authorization` Caffeine component
2. Generate Motoko backend with all models, auth, and role-gated APIs
3. Build frontend:
   - Public pharmacy list (home)
   - Pharmacy detail page with action buttons
   - Login page with role-based redirect
   - Pharmacy dashboard (edit + stats + en_attente notice)
   - Admin dashboard (validate pharmacies, manage accounts, add pharmacy)
4. Mobile-first layout, large buttons, French UI, green/white theme
5. Deploy
