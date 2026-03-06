import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Utilisateur {
    id: Principal;
    nom: string;
    role: UserRole;
    statutCompte: StatutCompte;
    email: string;
    motDePasseHash: string;
}
export type PharmacyId = bigint;
export interface Pharmacie {
    id: PharmacyId;
    ownerId?: Principal;
    nombreVues: bigint;
    commune: string;
    nomPharmacie: string;
    statutOuvert: boolean;
    adresse: string;
    telephone: string;
    statutPharmacie: StatutPharmacie;
    horaires: string;
}
export interface UserProfile {
    nom: string;
    role: UserRole;
    statutCompte: StatutCompte;
    email: string;
}
export enum StatutCompte {
    actif = "actif",
    suspendu = "suspendu",
    enAttente = "enAttente"
}
export enum StatutPharmacie {
    validee = "validee",
    enAttente = "enAttente",
    suspendue = "suspendue"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    pharmacy = "pharmacy"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    ajoutParAdmin(nomPharmacie: string, commune: string, adresse: string, telephone: string, horaires: string, statutOuvert: boolean, valideParAdmin: boolean): Promise<PharmacyId>;
    ajoutParPharmacie(nomPharmacie: string, commune: string, adresse: string, telephone: string, horaires: string): Promise<PharmacyId>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    getAdminPharmacies(): Promise<Array<Pharmacie>>;
    getAllPharmacies(): Promise<Array<Pharmacie>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getMesPharmacies(): Promise<Array<Pharmacie>>;
    getMesPharmaciesVues(id: PharmacyId): Promise<bigint>;
    getPharmacyById(id: PharmacyId): Promise<Pharmacie | null>;
    getTousLesUtilisateurs(): Promise<Array<Utilisateur>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUtilisateur(): Promise<Utilisateur>;
    getUtilisateursPharmacies(): Promise<Array<Utilisateur>>;
    initAdmin(): Promise<string>;
    inscriptionUtilisateur(nom: string, email: string, motDePasse: string, role: UserRole): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    modifierStatutUtilisateur(userId: Principal, statutCompte: StatutCompte): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    supprimerPharmacie(pharmacyId: PharmacyId): Promise<void>;
    updatePharmacieProprietaire(id: PharmacyId, horaires: string, telephone: string, adresse: string, statutOuvert: boolean): Promise<void>;
    validatePharmacie(pharmacyId: PharmacyId, validation: boolean): Promise<void>;
}
