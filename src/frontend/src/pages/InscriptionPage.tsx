import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserRole } from "../backend.d";
import { Layout } from "../components/Layout";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useInscriptionMutation } from "../hooks/useQueries";

export function InscriptionPage() {
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.pharmacy);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);

  // Additional pharmacy fields
  const [nomPharmacie, setNomPharmacie] = useState("");
  const [adressePharmacie, setAdressePharmacie] = useState("");
  const [telephonePharmacie, setTelephonePharmacie] = useState("");
  const [horairesPharmacie, setHorairesPharmacie] = useState("");

  const mutation = useInscriptionMutation();
  const { identity, isInitializing, login, isLoggingIn } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();

  // When identity is available, check if user already has an account
  useEffect(() => {
    if (!identity || !actor || isFetching) return;

    setCheckingExisting(true);
    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (profile) {
          // Account already exists — redirect to login page with message
          setAlreadyExists(true);
        }
      })
      .catch(() => {
        // No account or error — allow inscription to proceed
      })
      .finally(() => {
        setCheckingExisting(false);
      });
  }, [identity, actor, isFetching]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identity) {
      setError(
        "Vous devez vous connecter avec Internet Identity avant de créer un compte.",
      );
      return;
    }

    if (!email.trim() || !motDePasse.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (motDePasse.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    // Pharmacy role requires additional fields
    if (selectedRole === UserRole.pharmacy) {
      if (
        !nomPharmacie.trim() ||
        !adressePharmacie.trim() ||
        !telephonePharmacie.trim() ||
        !horairesPharmacie.trim()
      ) {
        setError("Veuillez remplir tous les champs de la pharmacie.");
        return;
      }
    } else {
      if (!nom.trim()) {
        setError("Veuillez remplir tous les champs.");
        return;
      }
    }

    // Encode pharmacy details into nom field using | separator
    const nomValue =
      selectedRole === UserRole.pharmacy
        ? `${nomPharmacie.trim()}|${adressePharmacie.trim()}|${telephonePharmacie.trim()}|${horairesPharmacie.trim()}`
        : nom.trim();

    try {
      await mutation.mutateAsync({
        nom: nomValue,
        email,
        motDePasse,
        role: selectedRole,
      });
      setSuccess(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erreur lors de l'inscription.";
      // Detect "already exists" error and show a friendly message
      if (
        msg.toLowerCase().includes("déjà existant") ||
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("existe")
      ) {
        setAlreadyExists(true);
      } else {
        setError(msg);
      }
    }
  };

  // Already has an account — show redirect message
  if (alreadyExists) {
    return (
      <Layout title="Inscription" showBack backTo="/pharmacien-login">
        <div
          className="px-4 py-12 max-w-sm mx-auto text-center space-y-4"
          data-ocid="inscription.already_exists_state"
        >
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Compte déjà existant
          </h2>
          <p className="text-sm text-muted-foreground">
            Un compte existe déjà pour cet identifiant. Vous n'avez pas besoin
            de vous inscrire à nouveau. Appuyez sur "Se connecter" pour accéder
            à votre espace.
          </p>
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={() => navigate({ to: "/pharmacien-login" })}
            data-ocid="inscription.go_to_login_button"
          >
            Se connecter
          </Button>
          <Link to="/" className="inline-block mt-2">
            <Button variant="outline" className="w-full">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout title="Inscription" showBack backTo="/pharmacien-login">
        <div
          className="px-4 py-12 max-w-sm mx-auto text-center space-y-4"
          data-ocid="inscription.success_state"
        >
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Inscription envoyée
          </h2>
          <p className="text-sm text-muted-foreground">
            Votre compte est en attente de validation par l'administrateur. Vous
            recevrez une confirmation dès que votre compte sera activé.
          </p>
          <Link to="/" className="inline-block mt-4">
            <Button variant="outline" className="w-full">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Créer un compte" showBack backTo="/">
      <div className="px-4 py-6 max-w-sm mx-auto space-y-5">
        <div className="bg-warning/10 border border-warning/30 rounded-lg px-4 py-3 text-sm text-warning-foreground">
          <strong>Note :</strong> Votre compte sera soumis à validation par
          l'administrateur avant d'être activé.
        </div>

        {/* Role selector */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Type de compte</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole(UserRole.pharmacy)}
              data-ocid="inscription.role_pharmacy_toggle"
              className={`h-12 rounded-lg border-2 text-sm font-semibold transition-all ${
                selectedRole === UserRole.pharmacy
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              🏥 Pharmacie
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole(UserRole.user)}
              data-ocid="inscription.role_user_toggle"
              className={`h-12 rounded-lg border-2 text-sm font-semibold transition-all ${
                selectedRole === UserRole.user
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              👤 Utilisateur
            </button>
          </div>
          <p className="text-xs text-muted-foreground px-1">
            {selectedRole === UserRole.pharmacy
              ? "Compte pour gérer une pharmacie dans l'application."
              : "Compte utilisateur simple pour accéder aux fonctionnalités."}
          </p>
        </div>

        {/* Step 1: Connect with Internet Identity first */}
        {!identity && (
          <div className="space-y-3">
            <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground text-center">
              Connectez-vous d'abord avec Internet Identity pour créer votre
              compte.
            </div>
            <Button
              onClick={() => login()}
              disabled={isLoggingIn || isInitializing}
              className="w-full h-12 text-base font-semibold"
              data-ocid="inscription.login_first_button"
            >
              {isLoggingIn || isInitializing ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Connexion...
                </span>
              ) : (
                "Se connecter avec Internet Identity"
              )}
            </Button>
          </div>
        )}

        {/* Checking if account already exists */}
        {identity && checkingExisting && (
          <div
            className="bg-secondary rounded-lg px-4 py-3 text-sm text-muted-foreground text-center"
            data-ocid="inscription.loading_state"
          >
            Vérification en cours...
          </div>
        )}

        {error && (
          <div
            className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive"
            data-ocid="inscription.error_state"
          >
            {error}
          </div>
        )}

        {/* Show form only when identity is ready and no existing account */}
        {identity && !checkingExisting && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Non-pharmacy: show nom complet field */}
            {selectedRole !== UserRole.pharmacy && (
              <div className="space-y-1.5">
                <Label htmlFor="nom">Nom complet</Label>
                <Input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="h-12 text-base"
                  data-ocid="inscription.nom_input"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="h-12 text-base"
                data-ocid="inscription.email_input"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motdepasse">Mot de passe</Label>
              <Input
                id="motdepasse"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="h-12 text-base"
                data-ocid="inscription.password_input"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>

            {/* Pharmacy-specific fields */}
            {selectedRole === UserRole.pharmacy && (
              <>
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Informations de la pharmacie
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nomPharmacie">Nom de la pharmacie</Label>
                  <Input
                    id="nomPharmacie"
                    type="text"
                    value={nomPharmacie}
                    onChange={(e) => setNomPharmacie(e.target.value)}
                    placeholder="Ex: Pharmacie de la Paix"
                    className="h-12 text-base"
                    data-ocid="inscription.pharmacy_name_input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adressePharmacie">Adresse complète</Label>
                  <Input
                    id="adressePharmacie"
                    type="text"
                    value={adressePharmacie}
                    onChange={(e) => setAdressePharmacie(e.target.value)}
                    placeholder="Ex: Av. des Aviateurs no 15, Gombe"
                    className="h-12 text-base"
                    data-ocid="inscription.pharmacy_address_input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="telephonePharmacie">
                    Numéro de téléphone
                  </Label>
                  <Input
                    id="telephonePharmacie"
                    type="tel"
                    value={telephonePharmacie}
                    onChange={(e) => setTelephonePharmacie(e.target.value)}
                    placeholder="Ex: +243 81 000 0001"
                    className="h-12 text-base"
                    data-ocid="inscription.pharmacy_phone_input"
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="horairesPharmacie">
                    Horaires d'ouverture
                  </Label>
                  <Input
                    id="horairesPharmacie"
                    type="text"
                    value={horairesPharmacie}
                    onChange={(e) => setHorairesPharmacie(e.target.value)}
                    placeholder="Ex: 08h-22h ou 24h/24"
                    className="h-12 text-base"
                    data-ocid="inscription.pharmacy_hours_input"
                    required
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full h-14 text-base font-semibold"
              data-ocid="inscription.submit_button"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Inscription en cours...
                </span>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link
            to="/pharmacien-login"
            className="text-primary font-semibold underline"
            data-ocid="inscription.login_link"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </Layout>
  );
}
