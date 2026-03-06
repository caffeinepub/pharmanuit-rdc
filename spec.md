# PharmaNuit RDC

## Current State
- Application complète avec 3 rôles : utilisateur (public), pharmacien, admin
- Interface admin sur `/admin-pharmanuit-dashboard`
- Backend Motoko avec pharmacies, utilisateurs, rôles
- La suspension d'une pharmacie utilise `validatePharmacie(id, false)` — ce qui met `valideParAdmin = false`, identique à "en attente". Il n'y a pas de distinction visuelle entre suspendu et en attente.
- Il n'existe pas de fonction de suppression de pharmacie dans le backend.
- La liste publique filtre déjà sur `valideParAdmin = true`, donc les pharmacies non validées/suspendues ne sont pas visibles des utilisateurs.

## Requested Changes (Diff)

### Add
- Nouvelle fonction backend `supprimerPharmacie(id)` réservée à l'admin pour supprimer définitivement une pharmacie
- Nouveau champ `statutPharmacie` sur le type `Pharmacie` avec 3 valeurs : `#validee`, `#enAttente`, `#suspendue` — pour distinguer visuellement les états dans l'admin
- Bouton "Supprimer" dans l'interface admin pour chaque pharmacie, avec confirmation avant suppression
- Badge "Suspendu" distinct (couleur différente du badge "En attente") dans la carte pharmacie de l'admin
- Mutation `useSupprimerPharmacieMutation` dans `useQueries.ts`

### Modify
- `validatePharmacie` : quand `validation = true` → `statutPharmacie = #validee`, quand `validation = false` → `statutPharmacie = #suspendue` (au lieu de laisser en attente)
- `ajoutParAdmin` et `ajoutParPharmacie` : initialiser `statutPharmacie` selon contexte (`#validee` ou `#enAttente`)
- `getAllPharmacies` (liste publique) : ne retourner que les pharmacies avec `statutPharmacie = #validee`
- `PharmacyCard` : afficher badge "Suspendu" distinct pour `statutPharmacie = suspendue`
- `AdminPage` (PharmaciesTab) : ajouter bouton Supprimer avec dialog de confirmation, appeler `supprimerPharmacie`

### Remove
- Rien à supprimer

## Implementation Plan
1. Régénérer le backend Motoko avec le champ `statutPharmacie`, la fonction `supprimerPharmacie`, et les modifications de `validatePharmacie`, `getAllPharmacies`
2. Mettre à jour `useQueries.ts` : ajouter `useSupprimerPharmacieMutation`
3. Mettre à jour `PharmacyCard.tsx` : badge suspendu distinct, prop `onSupprimer`
4. Mettre à jour `AdminPage.tsx` : bouton Supprimer avec dialog de confirmation dans `PharmaciesTab`
