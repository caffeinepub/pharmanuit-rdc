import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Bool "mo:core/Bool";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Custom Types
  type UserRole = {
    #admin;
    #user;
    #pharmacy;
  };

  module UserRole {
    public func toText(role : UserRole) : Text {
      switch (role) {
        case (#admin) { "admin" };
        case (#user) { "user" };
        case (#pharmacy) { "pharmacy" };
      };
    };
  };

  type StatutCompte = {
    #actif;
    #enAttente;
    #suspendu;
  };

  module StatutCompte {
    public func compare(a : StatutCompte, b : StatutCompte) : Order.Order {
      switch (a, b) {
        case (#actif, #actif) { #equal };
        case (#actif, _) { #less };
        case (#enAttente, #actif) { #greater };
        case (#enAttente, #enAttente) { #equal };
        case (#enAttente, #suspendu) { #less };
        case (#suspendu, #suspendu) { #equal };
        case (#suspendu, _) { #greater };
      };
    };
    public func toText(status : StatutCompte) : Text {
      switch (status) {
        case (#actif) { "actif" };
        case (#enAttente) { "en attente" };
        case (#suspendu) { "suspendu" };
      };
    };
  };

  type StatutPharmacie = {
    #validee;
    #enAttente;
    #suspendue;
  };

  module StatutPharmacie {
    public func compare(a : StatutPharmacie, b : StatutPharmacie) : Order.Order {
      switch (a, b) {
        case (#validee, #validee) { #equal };
        case (#validee, _) { #less };
        case (#enAttente, #validee) { #greater };
        case (#enAttente, #enAttente) { #equal };
        case (#enAttente, #suspendue) { #less };
        case (#suspendue, #suspendue) { #equal };
        case (#suspendue, _) { #greater };
      };
    };

    public func toText(status : StatutPharmacie) : Text {
      switch (status) {
        case (#validee) { "validée" };
        case (#enAttente) { "en attente" };
        case (#suspendue) { "suspendue" };
      };
    };
  };

  type Utilisateur = {
    id : Principal;
    nom : Text;
    email : Text;
    motDePasseHash : Text;
    role : UserRole;
    statutCompte : StatutCompte;
  };

  type PharmacyId = Nat;

  type Pharmacie = {
    id : PharmacyId;
    nomPharmacie : Text;
    commune : Text;
    adresse : Text;
    telephone : Text;
    horaires : Text;
    statutOuvert : Bool;
    statutPharmacie : StatutPharmacie;
    nombreVues : Nat;
    ownerId : ?Principal;
  };

  public type UserProfile = {
    nom : Text;
    email : Text;
    role : UserRole;
    statutCompte : StatutCompte;
  };

  var nextPharmacieId : PharmacyId = 1;

  let utilisateurs = Map.empty<Principal, Utilisateur>();
  let pharmacies = Map.empty<PharmacyId, Pharmacie>();

  let accessControlState : AccessControl.AccessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func mapToAccessControlRole(role : UserRole) : AccessControl.UserRole {
    switch (role) {
      case (#admin) { #admin };
      case (#user) { #user };
      case (#pharmacy) { #user };
    };
  };

  func getUtilisateurOrTrap(caller : Principal) : Utilisateur {
    switch (utilisateurs.get(caller)) {
      case (null) {
        Runtime.trap("Utilisateur pour le principal fourni n'existe pas");
      };
      case (?util) { util };
    };
  };

  func getPharmacieOrTrap(pharmacyId : PharmacyId) : Pharmacie {
    switch (pharmacies.get(pharmacyId)) {
      case (null) {
        Runtime.trap("Pharmacie non trouvée");
      };
      case (?p) { p };
    };
  };

  func verifyPharmacyAccess(caller : Principal) : Utilisateur {
    // First check AccessControl permission
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé: seuls les utilisateurs authentifiés peuvent effectuer cette action");
    };

    let utilisateur = getUtilisateurOrTrap(caller);
    if (utilisateur.role != #pharmacy) {
      Runtime.trap("Non autorisé: seuls les pharmacies peuvent effectuer cette action");
    };
    switch (utilisateur.statutCompte) {
      case (#actif) { utilisateur };
      case (#enAttente) {
        Runtime.trap("Votre compte pharmacie n'est pas encore actif");
      };
      case (#suspendu) {
        Runtime.trap("Votre compte pharmacie est suspendu. Veuillez contacter l'administrateur");
      };
    };
  };

  func hasAdminUser() : Bool {
    for ((_, user) in utilisateurs.entries()) {
      if (user.role == #admin) {
        return true;
      };
    };
    false;
  };

  public shared ({ caller }) func initAdmin() : async Text {
    if (hasAdminUser()) {
      return "Un administrateur existe déjà";
    };

    let admin : Utilisateur = {
      id = caller;
      nom = "Admin";
      email = "admin@pharma.com";
      motDePasseHash = "admin";
      role = #admin;
      statutCompte = #actif;
    };
    utilisateurs.add(caller, admin);
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    "Accès administrateur activé";
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    // Check authentication first, but don't trap if user doesn't exist
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé: Seuls les utilisateurs peuvent voir leur profil");
    };
    
    // Return null if no profile exists (don't trap)
    switch (utilisateurs.get(caller)) {
      case (null) { null };
      case (?util) {
        ?{
          nom = util.nom;
          email = util.email;
          role = util.role;
          statutCompte = util.statutCompte;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Non autorisé: Vous ne pouvez voir que votre propre profil");
    };
    switch (utilisateurs.get(user)) {
      case (null) { null };
      case (?util) {
        ?{
          nom = util.nom;
          email = util.email;
          role = util.role;
          statutCompte = util.statutCompte;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    // Check authentication
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé: Seuls les utilisateurs peuvent sauvegarder leur profil");
    };
    
    // Get user (must exist to save profile)
    let utilisateur = getUtilisateurOrTrap(caller);

    // Users cannot change their own role or status - only admin can do that
    if (profile.role != utilisateur.role or profile.statutCompte != utilisateur.statutCompte) {
      Runtime.trap("Non autorisé: Vous ne pouvez pas modifier votre rôle ou statut");
    };

    // Allow profile updates regardless of account status (enAttente, actif, or suspendu)
    // Users should be able to update their profile information even if not yet validated
    let updatedUtilisateur = {
      id = utilisateur.id;
      nom = profile.nom;
      email = profile.email;
      motDePasseHash = utilisateur.motDePasseHash;
      role = utilisateur.role;
      statutCompte = utilisateur.statutCompte;
    };
    utilisateurs.add(caller, updatedUtilisateur);
  };

  public query func getAllPharmacies() : async [Pharmacie] {
    // Public function - no authorization needed
    pharmacies.values().toArray().filter(func(p) { p.statutPharmacie == #validee });
  };

  public shared func getPharmacyById(id : PharmacyId) : async ?Pharmacie {
    // Public function - no authorization needed
    // Incrémente immédiatement les vues si la pharmacie existe
    let pharmacie = pharmacies.get(id);
    switch (pharmacie) {
      case (null) { null };
      case (?pharmacie) {
        pharmacies.add(
          id,
          {
            id = pharmacie.id;
            nomPharmacie = pharmacie.nomPharmacie;
            commune = pharmacie.commune;
            adresse = pharmacie.adresse;
            telephone = pharmacie.telephone;
            horaires = pharmacie.horaires;
            statutOuvert = pharmacie.statutOuvert;
            statutPharmacie = pharmacie.statutPharmacie;
            nombreVues = pharmacie.nombreVues + 1;
            ownerId = pharmacie.ownerId;
          },
        );
        ?pharmacie;
      };
    };
  };

  public shared ({ caller }) func inscriptionUtilisateur(
    nom : Text,
    email : Text,
    motDePasse : Text,
    role : UserRole,
  ) : async () {
    // Public registration - no prior auth needed, but prevent duplicate registration
    if (utilisateurs.containsKey(caller)) {
      Runtime.trap("Utilisateur déjà existant avec cet id");
    };

    if (role == #admin) {
      Runtime.trap("Non autorisé: Vous ne pouvez pas vous attribuer le rôle d'administrateur");
    };

    // All new accounts start in #enAttente status
    let statutCompte = #enAttente;

    let nouvelUtilisateur : Utilisateur = {
      id = caller;
      nom;
      email;
      motDePasseHash = motDePasse;
      role;
      statutCompte;
    };

    utilisateurs.add(caller, nouvelUtilisateur);

    let accessControlRole = mapToAccessControlRole(role);
    accessControlState.userRoles.add(caller, accessControlRole);
  };

  public query ({ caller }) func getUtilisateur() : async Utilisateur {
    // User can only get their own data
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé: Vous devez être authentifié");
    };
    getUtilisateurOrTrap(caller);
  };

  public query ({ caller }) func getAdminPharmacies() : async [Pharmacie] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Non autorisé: seuls les administrateurs peuvent répertorier toutes les pharmacies");
    };
    pharmacies.values().toArray();
  };

  public shared ({ caller }) func validatePharmacie(
    pharmacyId : PharmacyId,
    validation : Bool,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Non autorisé: seuls les administrateurs peuvent valider les pharmacies");
    };

    validateOrSuspendPharmacie(pharmacyId, validation, true);
  };

  public shared ({ caller }) func supprimerPharmacie(pharmacyId : PharmacyId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Non autorisé: seuls les administrateurs peuvent supprimer les pharmacies");
    };

    if (not pharmacies.containsKey(pharmacyId)) {
      Runtime.trap("Pharmacie non trouvée");
    };

    pharmacies.remove(pharmacyId);
  };

  public shared ({ caller }) func modifierStatutUtilisateur(
    userId : Principal,
    statutCompte : StatutCompte,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Non autorisé: seuls les administrateurs peuvent modifier le statut des utilisateurs");
    };
    let utilisateur = utilisateurs.get(userId);
    switch (utilisateur) {
      case (null) {
        Runtime.trap("Utilisateur pour le principal fourni n'existe pas");
      };
      case (?utilisateur) {
        let nouvelUtilisateur = {
          id = utilisateur.id;
          nom = utilisateur.nom;
          email = utilisateur.email;
          motDePasseHash = utilisateur.motDePasseHash;
          role = utilisateur.role;
          statutCompte;
        };
        utilisateurs.add(userId, nouvelUtilisateur);
      };
    };
  };

  public shared ({ caller }) func ajoutParAdmin(
    nomPharmacie : Text,
    commune : Text,
    adresse : Text,
    telephone : Text,
    horaires : Text,
    statutOuvert : Bool,
    valideParAdmin : Bool,
  ) : async PharmacyId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Non autorisé: seuls les administrateurs peuvent ajouter des pharmacies");
    };
    let statutPharmacie = if (valideParAdmin) {
      #validee;
    } else {
      #enAttente;
    };

    let nouvellePharmacie : Pharmacie = {
      id = nextPharmacieId;
      nomPharmacie;
      commune;
      adresse;
      telephone;
      horaires;
      statutOuvert;
      statutPharmacie;
      nombreVues = 0;
      ownerId = null;
    };

    pharmacies.add(nextPharmacieId, nouvellePharmacie);
    let pharmacieId = nextPharmacieId;
    nextPharmacieId += 1;
    pharmacieId;
  };

  public query ({ caller }) func getUtilisateursPharmacies() : async [Utilisateur] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Non autorisé: seuls les administrateurs peuvent lister les utilisateurs pharmacies");
    };
    utilisateurs.values().toArray().filter(
      func(u) { u.role == #pharmacy }
    );
  };

  public query ({ caller }) func getTousLesUtilisateurs() : async [Utilisateur] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Non autorisé: seuls les administrateurs peuvent accéder à tous les utilisateurs");
    };
    utilisateurs.values().toArray().filter(
      func(u) { u.role != #admin }
    );
  };

  public shared ({ caller }) func ajoutParPharmacie(
    nomPharmacie : Text,
    commune : Text,
    adresse : Text,
    telephone : Text,
    horaires : Text,
  ) : async PharmacyId {
    let utilisateur = verifyPharmacyAccess(caller);

    let nouvellePharmacie : Pharmacie = {
      id = nextPharmacieId;
      nomPharmacie;
      commune;
      adresse;
      telephone;
      horaires;
      statutOuvert = false;
      statutPharmacie = #enAttente;
      nombreVues = 0;
      ownerId = ?caller;
    };

    pharmacies.add(nextPharmacieId, nouvellePharmacie);
    nextPharmacieId += 1;
    nouvellePharmacie.id;
  };

  public query ({ caller }) func getMesPharmacies() : async [Pharmacie] {
    // Verify AccessControl permission first
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé: Vous devez être authentifié");
    };

    let utilisateur = getUtilisateurOrTrap(caller);
    if (utilisateur.role != #pharmacy) {
      Runtime.trap("Non autorisé: seuls les pharmacies peuvent voir leurs pharmacies");
    };
    switch (utilisateur.statutCompte) {
      case (#actif) {};
      case (#enAttente) {
        Runtime.trap("Votre compte pharmacie n'est pas encore actif");
      };
      case (#suspendu) {
        Runtime.trap("Votre compte pharmacie est suspendu. Veuillez contacter l'administrateur");
      };
    };
    pharmacies.values().toArray().filter(
      func(p) {
        switch (p.ownerId) {
          case (?id) { id == caller };
          case (null) { false };
        };
      }
    );
  };

  public shared ({ caller }) func updatePharmacieProprietaire(
    id : PharmacyId,
    horaires : Text,
    telephone : Text,
    adresse : Text,
    statutOuvert : Bool,
  ) : async () {
    let utilisateur = verifyPharmacyAccess(caller);

    let pharmacie = pharmacies.get(id);
    switch (pharmacie) {
      case (null) {
        Runtime.trap("Pharmacie non trouvée");
      };
      case (?pharmacie) {
        switch (pharmacie.ownerId) {
          case (?ownerId) {
            if (ownerId != caller) {
              Runtime.trap("Non autorisé: vous n'êtes pas le propriétaire de cette pharmacie");
            };
          };
          case (null) {
            Runtime.trap("Non autorisé: cette pharmacie n'a pas de propriétaire");
          };
        };
        pharmacies.add(
          id,
          {
            id = pharmacie.id;
            nomPharmacie = pharmacie.nomPharmacie;
            commune = pharmacie.commune;
            adresse;
            telephone;
            horaires;
            statutOuvert;
            statutPharmacie = pharmacie.statutPharmacie;
            nombreVues = pharmacie.nombreVues;
            ownerId = pharmacie.ownerId;
          },
        );
      };
    };
  };

  public query ({ caller }) func getMesPharmaciesVues(id : PharmacyId) : async Nat {
    // Verify AccessControl permission first
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Non autorisé: Vous devez être authentifié");
    };

    let utilisateur = getUtilisateurOrTrap(caller);
    if (utilisateur.role != #pharmacy) {
      Runtime.trap("Non autorisé: seuls les pharmacies peuvent voir les vues");
    };
    switch (utilisateur.statutCompte) {
      case (#actif) {};
      case (#enAttente) {
        Runtime.trap("Votre compte pharmacie n'est pas encore actif");
      };
      case (#suspendu) {
        Runtime.trap("Votre compte pharmacie est suspendu. Veuillez contacter l'administrateur");
      };
    };

    let pharmacie = pharmacies.get(id);
    switch (pharmacie) {
      case (null) {
        Runtime.trap("Pharmacie non trouvée");
      };
      case (?pharmacie) {
        switch (pharmacie.ownerId) {
          case (?ownerId) {
            if (ownerId != caller) {
              Runtime.trap("Non autorisé: vous n'êtes pas le propriétaire de cette pharmacie");
            };
            pharmacie.nombreVues;
          };
          case (null) {
            Runtime.trap("Non autorisé: cette pharmacie n'a pas de propriétaire");
          };
        };
      };
    };
  };

  // Nouvelle logique - Valider/Suspendre Pharmacie
  func validateOrSuspendPharmacie(
    pharmacyId : PharmacyId,
    validation : Bool,
    isAdminAction : Bool,
  ) {
    let pharmacie = getPharmacieOrTrap(pharmacyId);
    let newStatus = if (validation) {
      #validee;
    } else {
      #suspendue;
    };
    pharmacies.add(
      pharmacyId,
      {
        id = pharmacie.id;
        nomPharmacie = pharmacie.nomPharmacie;
        commune = pharmacie.commune;
        adresse = pharmacie.adresse;
        telephone = pharmacie.telephone;
        horaires = pharmacie.horaires;
        statutOuvert = pharmacie.statutOuvert;
        statutPharmacie = newStatus;
        nombreVues = pharmacie.nombreVues;
        ownerId = pharmacie.ownerId;
      },
    );
  };
};
