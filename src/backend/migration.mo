import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // StatutPharmacie type
  type StatutPharmacie = {
    #validee;
    #enAttente;
    #suspendue;
  };

  // Old types
  type Utilisateur = {
    id : Principal;
    nom : Text;
    email : Text;
    motDePasseHash : Text;
    role : {
      #admin;
      #user;
      #pharmacy;
    };
    statutCompte : {
      #actif;
      #enAttente;
      #suspendu;
    };
  };

  type OldPharmacie = {
    id : Nat;
    nomPharmacie : Text;
    commune : Text;
    adresse : Text;
    telephone : Text;
    horaires : Text;
    statutOuvert : Bool;
    valideParAdmin : Bool;
    nombreVues : Nat;
    ownerId : ?Principal;
  };

  type OldActor = {
    utilisateurs : Map.Map<Principal, Utilisateur>;
    pharmacies : Map.Map<Nat, OldPharmacie>;
    nextPharmacieId : Nat;
  };

  // New types
  type NewPharmacie = {
    id : Nat;
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

  type NewActor = {
    utilisateurs : Map.Map<Principal, Utilisateur>;
    pharmacies : Map.Map<Nat, NewPharmacie>;
    nextPharmacieId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newPharmacies = old.pharmacies.map<Nat, OldPharmacie, NewPharmacie>(
      func(_id, oldPharmacy) {
        {
          oldPharmacy with
          statutPharmacie = if (oldPharmacy.valideParAdmin) { #validee } else {
            #enAttente;
          }
        };
      }
    );
    {
      old with
      pharmacies = newPharmacies;
    };
  };
};
