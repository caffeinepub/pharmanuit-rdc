import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { useInscriptionMutation } from "../hooks/useQueries";

export function InscriptionPage() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useInscriptionMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !email.trim() || !motDePasse.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (motDePasse.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      await mutation.mutateAsync({ nom, email, motDePasse });
      setSuccess(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erreur lors de l'inscription.";
      setError(msg);
    }
  };

  if (success) {
    return (
      <Layout title="Inscription" showBack backTo="/login">
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
    <Layout title="Créer un compte pharmacie" showBack backTo="/login">
      <div className="px-4 py-6 max-w-sm mx-auto space-y-5">
        <div className="bg-warning/10 border border-warning/30 rounded-lg px-4 py-3 text-sm text-warning-foreground">
          <strong>Note :</strong> Votre compte sera soumis à validation par
          l'administrateur avant d'être visible.
        </div>

        {error && (
          <div
            className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive"
            data-ocid="inscription.error_state"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nom">Nom complet / Nom de la pharmacie</Label>
            <Input
              id="nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Pharmacie de la Paix"
              className="h-12 text-base"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="h-12 text-base"
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
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          <div className="bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground">
            Rôle : <strong>Pharmacie</strong> (fixé automatiquement)
          </div>

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

        <p className="text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link to="/login" className="text-primary font-semibold underline">
            Se connecter
          </Link>
        </p>
      </div>
    </Layout>
  );
}
