import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatutCompte, UserRole } from "../backend.d";
import type { Pharmacie } from "../backend.d";
import { Layout } from "../components/Layout";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAjoutParPharmacieMutation,
  useCallerProfile,
  useMesPharmacies,
  useUpdatePharmacieMutation,
} from "../hooks/useQueries";

function StatusBanner({ statut }: { statut: StatutCompte }) {
  if (statut === StatutCompte.enAttente) {
    return (
      <div className="bg-warning/10 border border-warning/30 rounded-lg px-4 py-3 text-sm text-warning-foreground">
        <strong>⏳ Compte en attente</strong> — Votre pharmacie n'est pas encore
        visible pour les utilisateurs. Un administrateur doit valider votre
        compte.
      </div>
    );
  }
  if (statut === StatutCompte.suspendu) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive">
        <strong>🚫 Compte suspendu</strong> — Votre compte a été suspendu.
        Contactez l'administrateur.
      </div>
    );
  }
  return null;
}

function PharmacieForm({
  pharmacie,
  onSaved,
}: {
  pharmacie: Pharmacie | null;
  onSaved: () => void;
}) {
  const updateMutation = useUpdatePharmacieMutation();
  const addMutation = useAjoutParPharmacieMutation();

  const [nomPharmacie, setNomPharmacie] = useState(
    pharmacie?.nomPharmacie ?? "",
  );
  const [commune, setCommune] = useState(pharmacie?.commune ?? "");
  const [adresse, setAdresse] = useState(pharmacie?.adresse ?? "");
  const [telephone, setTelephone] = useState(pharmacie?.telephone ?? "");
  const [horaires, setHoraires] = useState(pharmacie?.horaires ?? "");
  const [statutOuvert, setStatutOuvert] = useState(
    pharmacie?.statutOuvert ?? false,
  );

  const isCreating = !pharmacie;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isCreating) {
        await addMutation.mutateAsync({
          nomPharmacie,
          commune,
          adresse,
          telephone,
          horaires,
        });
        toast.success("Pharmacie ajoutée avec succès !");
      } else {
        await updateMutation.mutateAsync({
          id: pharmacie.id,
          horaires,
          telephone,
          adresse,
          statutOuvert,
        });
        toast.success("Informations mises à jour !");
      }
      onSaved();
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    }
  };

  const isPending = updateMutation.isPending || addMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="dashboard.edit_form"
    >
      {isCreating && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="nomPharmacie">Nom de la pharmacie</Label>
            <Input
              id="nomPharmacie"
              value={nomPharmacie}
              onChange={(e) => setNomPharmacie(e.target.value)}
              placeholder="Pharmacie de la Paix"
              className="h-12 text-base"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="commune">Commune</Label>
            <Input
              id="commune"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              placeholder="Gombe"
              className="h-12 text-base"
              required
            />
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="adresse">Adresse</Label>
        <Input
          id="adresse"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="Av. des Aviateurs no 15"
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="telephone">Téléphone</Label>
        <Input
          id="telephone"
          type="tel"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="+243 81 000 0001"
          className="h-12 text-base"
          autoComplete="tel"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="horaires">Horaires d'ouverture</Label>
        <Input
          id="horaires"
          value={horaires}
          onChange={(e) => setHoraires(e.target.value)}
          placeholder="07h-22h ou 24h/24"
          className="h-12 text-base"
          required
        />
      </div>

      {!isCreating && (
        <div className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3">
          <div>
            <Label htmlFor="statutOuvert" className="text-base font-medium">
              Statut d'ouverture
            </Label>
            <p className="text-xs text-muted-foreground">
              {statutOuvert ? "Pharmacie ouverte" : "Pharmacie fermée"}
            </p>
          </div>
          <Switch
            id="statutOuvert"
            checked={statutOuvert}
            onCheckedChange={setStatutOuvert}
            data-ocid="dashboard.statut_switch"
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-14 text-base font-semibold"
        data-ocid="dashboard.save_button"
      >
        {isPending ? (
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
            Sauvegarde...
          </span>
        ) : isCreating ? (
          "Ajouter ma pharmacie"
        ) : (
          "Enregistrer les modifications"
        )}
      </Button>
    </form>
  );
}

export function PharmacieDashboardPage() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { isFetching } = useActor();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const {
    data: pharmacies = [],
    isLoading: pharmaciesLoading,
    refetch,
  } = useMesPharmacies();

  // Redirect if not authenticated
  useEffect(() => {
    if (!identity && !isFetching) {
      navigate({ to: "/login" });
    }
  }, [identity, isFetching, navigate]);

  // Redirect if not pharmacy role
  useEffect(() => {
    if (profile && profile.role !== UserRole.pharmacy) {
      if (profile.role === UserRole.admin) {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/" });
      }
    }
  }, [profile, navigate]);

  const handleLogout = () => {
    clear();
    navigate({ to: "/" });
  };

  if (profileLoading || pharmaciesLoading) {
    return (
      <Layout title="Mon tableau de bord" showBack backTo="/">
        <div
          className="px-4 py-6 space-y-4 max-w-lg mx-auto"
          data-ocid="dashboard.loading_state"
        >
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </Layout>
    );
  }

  const pharmacy = pharmacies[0] ?? null;

  return (
    <Layout
      title="Mon tableau de bord"
      showBack
      backTo="/"
      rightSlot={
        <button
          type="button"
          onClick={handleLogout}
          className="text-white/80 text-sm hover:text-white transition-colors"
          data-ocid="nav.logout_button"
        >
          Déconnexion
        </button>
      }
    >
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {profile && <StatusBanner statut={profile.statutCompte} />}

        {/* Vues stat */}
        {pharmacy && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">
                {pharmacy.nombreVues.toString()}
              </p>
              <p className="text-sm text-muted-foreground">
                vue{pharmacy.nombreVues !== 1n ? "s" : ""} sur votre pharmacie
              </p>
            </div>
          </div>
        )}

        {/* Pharmacy name display */}
        {pharmacy && (
          <div className="bg-card border border-border rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground">Votre pharmacie</p>
            <p className="font-bold text-lg text-foreground">
              {pharmacy.nomPharmacie}
            </p>
            <p className="text-sm text-muted-foreground">{pharmacy.commune}</p>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <h3 className="font-semibold text-foreground mb-3">
            {pharmacy
              ? "Modifier les informations"
              : "Enregistrer votre pharmacie"}
          </h3>
          <PharmacieForm pharmacie={pharmacy} onSaved={() => refetch()} />
        </div>
      </div>
    </Layout>
  );
}
