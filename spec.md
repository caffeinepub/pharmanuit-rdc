# PharmaNuit RDC

## Current State

The app has 3 roles (admin, pharmacy, user) and uses Internet Identity for authentication. The current login flow is broken: a single `/login` route serves both pharmacists and admins, with an "Activate Admin" button visible to anyone who logs in without an existing profile. The admin route `/admin` is accessible by navigating directly. There is no strict role separation at the routing level.

Key issues:
- The "Espace pharmacie" button on HomePage links to `/login` which shows both admin setup and pharmacy login in the same UI.
- Any user who logs in without a profile sees the "Activate Admin" button — a major security flaw.
- No separate, hidden admin entry point.
- No automatic redirection guards at route level based on role.

## Requested Changes (Diff)

### Add
- `/pharmacien-login` — dedicated login page for pharmacists only (Internet Identity). After login, verifies role === pharmacy and redirects to `/pharmacie-dashboard`. If role === admin, redirects to `/admin` without showing the admin setup button.
- `/admin-secret` — hidden admin entry point, not linked anywhere in the public UI. Provides Internet Identity login, checks role === admin, redirects to `/admin`. If not admin, shows a generic "access denied" without revealing this is the admin route.
- `PharmacienLoginPage.tsx` — new component for pharmacist-only login with inscription link.
- `AdminLoginPage.tsx` — new component for the hidden admin entry point.

### Modify
- `HomePage.tsx` — change the "Espace pharmacie" link from `/login` to `/pharmacien-login`. Rename button text to "Espace Pharmacien".
- `LoginPage.tsx` — repurpose as the pharmacist-only login (rename to `PharmacienLoginPage.tsx`). Remove the admin setup button entirely. If role === admin after login, redirect silently to `/admin` without showing any admin UI.
- `AdminPage.tsx` — strengthen the role guard: if no identity or role !== admin, redirect to `/` (not `/login`).
- `PharmacieDashboardPage.tsx` — strengthen the role guard: if role === admin, redirect to `/admin` (not `/login`); if role is user/unknown, redirect to `/`.
- `App.tsx` — add the two new routes (`/pharmacien-login`, `/admin-secret`), keep existing routes unchanged.
- `InscriptionPage.tsx` — update backTo from `/login` to `/pharmacien-login`.

### Remove
- The "Activer mon accès Administrateur" button from the pharmacist login flow.
- Any visible link to the admin section from the public or pharmacist UI.

## Implementation Plan

1. Create `PharmacienLoginPage.tsx`: Internet Identity login, post-login fetches profile, redirects pharmacy → `/pharmacie-dashboard`, admin → `/admin` silently, user/null → shows error "Accès réservé aux pharmacies".
2. Create `AdminLoginPage.tsx`: Internet Identity login at hidden `/admin-secret` route, post-login fetches profile, redirects admin → `/admin`, non-admin → generic "Accès non autorisé" (no admin reference).
3. Update `HomePage.tsx`: change link `to="/pharmacien-login"`, label "Espace Pharmacien".
4. Update `InscriptionPage.tsx`: change backTo to `/pharmacien-login`.
5. Update `AdminPage.tsx`: redirect to `/` if no identity or role !== admin (remove redirect to `/login`).
6. Update `PharmacieDashboardPage.tsx`: redirect to `/` if no identity or wrong role (admin goes to `/admin`).
7. Update `App.tsx`: add routes for `/pharmacien-login` and `/admin-secret`, keep `/login` route pointing to `PharmacienLoginPage` for backwards compatibility.
