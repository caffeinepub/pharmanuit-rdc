import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Pharmacie,
  PharmacyId,
  StatutCompte,
  UserProfile,
  Utilisateur,
} from "../backend.d";
import { UserRole } from "../backend.d";
import { useActor } from "./useActor";

// ---- Public Queries ----

export function useAllPharmacies() {
  const { actor, isFetching } = useActor();
  return useQuery<Pharmacie[]>({
    queryKey: ["pharmacies", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPharmacies();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function usePharmacyById(id: PharmacyId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Pharmacie | null>({
    queryKey: ["pharmacy", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPharmacyById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
    staleTime: 0,
  });
}

// ---- Auth ----

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

// ---- Pharmacy Owner ----

export function useMesPharmacies() {
  const { actor, isFetching } = useActor();
  return useQuery<Pharmacie[]>({
    queryKey: ["mesPharmacies"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMesPharmacies();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useMesPharmaciesVues(id: PharmacyId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["mesVues", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return 0n;
      return actor.getMesPharmaciesVues(id);
    },
    enabled: !!actor && !isFetching && id !== null,
    staleTime: 30_000,
  });
}

export function useUpdatePharmacieMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      horaires,
      telephone,
      adresse,
      statutOuvert,
    }: {
      id: PharmacyId;
      horaires: string;
      telephone: string;
      adresse: string;
      statutOuvert: boolean;
    }) => {
      if (!actor) throw new Error("Non connecté");
      return actor.updatePharmacieProprietaire(
        id,
        horaires,
        telephone,
        adresse,
        statutOuvert,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mesPharmacies"] });
      queryClient.invalidateQueries({ queryKey: ["adminPharmacies"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacies"] });
    },
  });
}

export function useAjoutParPharmacieMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      nomPharmacie,
      commune,
      adresse,
      telephone,
      horaires,
    }: {
      nomPharmacie: string;
      commune: string;
      adresse: string;
      telephone: string;
      horaires: string;
    }) => {
      if (!actor) throw new Error("Non connecté");
      return actor.ajoutParPharmacie(
        nomPharmacie,
        commune,
        adresse,
        telephone,
        horaires,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mesPharmacies"] });
    },
  });
}

// ---- Admin Queries ----

export function useAdminPharmacies() {
  const { actor, isFetching } = useActor();
  return useQuery<Pharmacie[]>({
    queryKey: ["adminPharmacies"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminPharmacies();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useUtilisateursPharmacies() {
  const { actor, isFetching } = useActor();
  return useQuery<Utilisateur[]>({
    queryKey: ["utilisateursPharmacies"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUtilisateursPharmacies();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useValidatePharmacieMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      validation,
    }: {
      id: PharmacyId;
      validation: boolean;
    }) => {
      if (!actor) throw new Error("Non connecté");
      return actor.validatePharmacie(id, validation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPharmacies"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacies"] });
    },
  });
}

export function useModifierStatutUtilisateurMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      statutCompte,
    }: {
      userId: import("@icp-sdk/core/principal").Principal;
      statutCompte: StatutCompte;
    }) => {
      if (!actor) throw new Error("Non connecté");
      return actor.modifierStatutUtilisateur(userId, statutCompte);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilisateursPharmacies"] });
    },
  });
}

export function useAjoutParAdminMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      nomPharmacie,
      commune,
      adresse,
      telephone,
      horaires,
      statutOuvert,
      valideParAdmin,
    }: {
      nomPharmacie: string;
      commune: string;
      adresse: string;
      telephone: string;
      horaires: string;
      statutOuvert: boolean;
      valideParAdmin: boolean;
    }) => {
      if (!actor) throw new Error("Non connecté");
      return actor.ajoutParAdmin(
        nomPharmacie,
        commune,
        adresse,
        telephone,
        horaires,
        statutOuvert,
        valideParAdmin,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPharmacies"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacies"] });
    },
  });
}

export function useInscriptionMutation() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      nom,
      email,
      motDePasse,
    }: {
      nom: string;
      email: string;
      motDePasse: string;
    }) => {
      if (!actor) throw new Error("Acteur non disponible");
      return actor.inscriptionUtilisateur(
        nom,
        email,
        motDePasse,
        UserRole.pharmacy,
      );
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSupprimerPharmacieMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: PharmacyId }) => {
      if (!actor) throw new Error("Non connecté");
      return actor.supprimerPharmacie(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPharmacies"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacies"] });
    },
  });
}
