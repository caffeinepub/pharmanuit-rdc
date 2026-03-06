import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { StatutCompte, StatutPharmacie, UserRole } from "../backend.d";
import type { Pharmacie } from "../backend.d";
import { Layout } from "../components/Layout";
import { PharmacyCard } from "../components/PharmacyCard";
import { SkeletonList } from "../components/SkeletonCard";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAdminPharmacies,
  useAjoutParAdminMutation,
  useCallerProfile,
  useModifierStatutUtilisateurMutation,
  useSupprimerPharmacieMutation,
  useUpdatePharmacieMutation,
  useUtilisateursPharmacies,
  useValidatePharmacieMutation,
} from "../hooks/useQueries";

// Edit modal form
function EditPharmacieModal({
  pharmacy,
  open,
  onClose,
}: {
  pharmacy: Pharmacie | null;
  open: boolean;
  onClose: () => void;
}) {
  const updateMutation = useUpdatePharmacieMutation();
  const [adresse, setAdresse] = useState(pharmacy?.adresse ?? "");
  const [commune, setCommune] = useState(pharmacy?.commune ?? "");
  const [telephone, setTelephone] = useState(pharmacy?.telephone ?? "");
  const [horaires, setHoraires] = useState(pharmacy?.horaires ?? "");
  const [statutOuvert, setStatutOuvert] = useState(
    pharmacy?.statutOuvert ?? false,
  );

  useEffect(() => {
    if (pharmacy) {
      setAdresse(pharmacy.adresse);
      setCommune(pharmacy.commune);
      setTelephone(pharmacy.telephone);
      setHoraires(pharmacy.horaires);
      setStatutOuvert(pharmacy.statutOuvert);
    }
  }, [pharmacy]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacy) return;
    try {
      await updateMutation.mutateAsync({
        id: pharmacy.id,
        horaires,
        telephone,
        adresse,
        statutOuvert,
      });
      toast.success("Pharmacie modifiée avec succès.");
      onClose();
    } catch {
      toast.error("Erreur lors de la modification.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-sm mx-auto"
        data-ocid="admin.pharmacy.dialog"
      >
        <DialogHeader>
          <DialogTitle>
            Modifier {pharmacy?.nomPharmacie ?? "la pharmacie"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nom (non modifiable)</Label>
            <Input
              value={pharmacy?.nomPharmacie ?? ""}
              disabled
              className="h-11 bg-muted"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-commune">Commune</Label>
            <Input
              id="edit-commune"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="h-11 text-base"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-adresse">Adresse</Label>
            <Input
              id="edit-adresse"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="h-11 text-base"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-tel">Téléphone</Label>
            <Input
              id="edit-tel"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="h-11 text-base"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-horaires">Horaires</Label>
            <Input
              id="edit-horaires"
              value={horaires}
              onChange={(e) => setHoraires(e.target.value)}
              className="h-11 text-base"
              required
            />
          </div>
          <div className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3">
            <Label htmlFor="edit-statut" className="text-base">
              {statutOuvert ? "Ouvert" : "Fermé"}
            </Label>
            <Switch
              id="edit-statut"
              checked={statutOuvert}
              onCheckedChange={setStatutOuvert}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={onClose}
              data-ocid="admin.pharmacy.cancel_button"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 h-12"
              data-ocid="admin.pharmacy.save_button"
            >
              {updateMutation.isPending ? "Sauvegarde..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Add pharmacy form
function AddPharmacieForm({ onAdded }: { onAdded: () => void }) {
  const addMutation = useAjoutParAdminMutation();
  const [nom, setNom] = useState("");
  const [commune, setCommune] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [horaires, setHoraires] = useState("");
  const [statutOuvert, setStatutOuvert] = useState(true);
  const [valideParAdmin, setValideParAdmin] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMutation.mutateAsync({
        nomPharmacie: nom,
        commune,
        adresse,
        telephone,
        horaires,
        statutOuvert,
        valideParAdmin,
      });
      toast.success("Pharmacie ajoutée avec succès !");
      setNom("");
      setCommune("");
      setAdresse("");
      setTelephone("");
      setHoraires("");
      setStatutOuvert(true);
      setValideParAdmin(true);
      setShowForm(false);
      onAdded();
    } catch {
      toast.error("Erreur lors de l'ajout.");
    }
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="w-full h-12"
        data-ocid="admin.add_pharmacy_button"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Ajouter une pharmacie
      </Button>
    );
  }

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 space-y-3"
      data-ocid="admin.add_pharmacy_form"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">Nouvelle pharmacie</h4>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-muted-foreground hover:text-foreground"
          data-ocid="admin.add_pharmacy_form.close_button"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="add-nom">Nom de la pharmacie</Label>
          <Input
            id="add-nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="h-11 text-base"
            required
            placeholder="Pharmacie de la Paix"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="add-commune">Commune</Label>
          <Input
            id="add-commune"
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            className="h-11 text-base"
            required
            placeholder="Gombe"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="add-adresse">Adresse</Label>
          <Input
            id="add-adresse"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            className="h-11 text-base"
            required
            placeholder="Av. des Aviateurs no 15"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="add-tel">Téléphone</Label>
          <Input
            id="add-tel"
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="h-11 text-base"
            required
            placeholder="+243 81 000 0001"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="add-horaires">Horaires</Label>
          <Input
            id="add-horaires"
            value={horaires}
            onChange={(e) => setHoraires(e.target.value)}
            className="h-11 text-base"
            required
            placeholder="07h-22h"
          />
        </div>
        <div className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3">
          <Label>{statutOuvert ? "Ouvert" : "Fermé"}</Label>
          <Switch checked={statutOuvert} onCheckedChange={setStatutOuvert} />
        </div>
        <div className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3">
          <Label>{valideParAdmin ? "Validé" : "En attente"}</Label>
          <Switch
            checked={valideParAdmin}
            onCheckedChange={setValideParAdmin}
          />
        </div>
        <Button
          type="submit"
          disabled={addMutation.isPending}
          className="w-full h-12"
          data-ocid="admin.add_pharmacy_submit"
        >
          {addMutation.isPending ? "Ajout..." : "Ajouter"}
        </Button>
      </form>
    </div>
  );
}

// Tab: Pharmacies
function PharmaciesTab() {
  const { data: pharmacies = [], isLoading, refetch } = useAdminPharmacies();
  const validateMutation = useValidatePharmacieMutation();
  const supprimerMutation = useSupprimerPharmacieMutation();
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacie | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pharmacie | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleValider = async (pharmacy: Pharmacie) => {
    try {
      await validateMutation.mutateAsync({ id: pharmacy.id, validation: true });
      toast.success(`${pharmacy.nomPharmacie} validée.`);
    } catch {
      toast.error("Erreur lors de la validation.");
    }
  };

  const handleSuspendre = async (pharmacy: Pharmacie) => {
    try {
      await validateMutation.mutateAsync({
        id: pharmacy.id,
        validation: false,
      });
      toast.success(`${pharmacy.nomPharmacie} suspendue.`);
    } catch {
      toast.error("Erreur lors de la suspension.");
    }
  };

  const handleModifier = (pharmacy: Pharmacie) => {
    setEditingPharmacy(pharmacy);
    setEditOpen(true);
  };

  const handleSupprimer = (pharmacy: Pharmacie) => {
    setDeleteTarget(pharmacy);
    setDeleteOpen(true);
  };

  const handleConfirmSupprimer = async () => {
    if (!deleteTarget) return;
    try {
      await supprimerMutation.mutateAsync({ id: deleteTarget.id });
      toast.success(`${deleteTarget.nomPharmacie} supprimée définitivement.`);
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const isPending = validateMutation.isPending || supprimerMutation.isPending;

  return (
    <div className="space-y-4">
      <AddPharmacieForm onAdded={() => refetch()} />

      {isLoading ? (
        <SkeletonList count={4} />
      ) : pharmacies.length === 0 ? (
        <div
          className="text-center py-10 text-muted-foreground"
          data-ocid="admin.pharmacies.empty_state"
        >
          Aucune pharmacie enregistrée.
        </div>
      ) : (
        <div className="space-y-3">
          {pharmacies.map((pharmacy, idx) => (
            <PharmacyCard
              key={pharmacy.id.toString()}
              pharmacy={pharmacy}
              index={idx + 1}
              showAdmin
              onValider={() => handleValider(pharmacy)}
              onSuspendre={() => handleSuspendre(pharmacy)}
              onModifier={() => handleModifier(pharmacy)}
              onSupprimer={() => handleSupprimer(pharmacy)}
              isPendingAction={isPending}
            />
          ))}
        </div>
      )}

      <EditPharmacieModal
        pharmacy={editingPharmacy}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingPharmacy(null);
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid="admin.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette pharmacie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La pharmacie{" "}
              <strong>{deleteTarget?.nomPharmacie}</strong> sera définitivement
              supprimée de l'application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.delete.cancel_button"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete.confirm_button"
              onClick={handleConfirmSupprimer}
              disabled={supprimerMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {supprimerMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Tab: Comptes
function ComptesTab() {
  const { data: utilisateurs = [], isLoading } = useUtilisateursPharmacies();
  const modifierStatutMutation = useModifierStatutUtilisateurMutation();

  const handleActiver = async (user: { id: Principal; nom: string }) => {
    try {
      await modifierStatutMutation.mutateAsync({
        userId: user.id,
        statutCompte: StatutCompte.actif,
      });
      toast.success(`${user.nom} activé.`);
    } catch {
      toast.error("Erreur lors de l'activation.");
    }
  };

  const handleSuspendre = async (user: { id: Principal; nom: string }) => {
    try {
      await modifierStatutMutation.mutateAsync({
        userId: user.id,
        statutCompte: StatutCompte.suspendu,
      });
      toast.success(`${user.nom} suspendu.`);
    } catch {
      toast.error("Erreur lors de la suspension.");
    }
  };

  if (isLoading) return <SkeletonList count={3} />;

  if (utilisateurs.length === 0) {
    return (
      <div
        className="text-center py-10 text-muted-foreground"
        data-ocid="admin.comptes.empty_state"
      >
        Aucun compte pharmacie enregistré.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {utilisateurs.map((user, idx) => (
        <div
          key={user.email}
          className="bg-card border border-border rounded-lg p-4 space-y-3"
          data-ocid={`admin.compte.item.${idx + 1}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {user.nom}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                user.statutCompte === StatutCompte.actif
                  ? "badge-valide"
                  : user.statutCompte === StatutCompte.enAttente
                    ? "badge-attente"
                    : "badge-suspendu"
              }`}
            >
              {user.statutCompte === StatutCompte.actif
                ? "Actif"
                : user.statutCompte === StatutCompte.enAttente
                  ? "En attente"
                  : "Suspendu"}
            </span>
          </div>
          <div className="flex gap-2">
            {user.statutCompte !== StatutCompte.actif && (
              <button
                type="button"
                className="action-btn bg-primary text-primary-foreground text-sm px-4 py-2 flex-1"
                style={{ minHeight: 40 }}
                onClick={() => handleActiver(user)}
                disabled={modifierStatutMutation.isPending}
                data-ocid={`admin.compte.activer_button.${idx + 1}`}
              >
                Activer
              </button>
            )}
            {user.statutCompte !== StatutCompte.suspendu && (
              <button
                type="button"
                className="action-btn bg-destructive text-destructive-foreground text-sm px-4 py-2 flex-1"
                style={{ minHeight: 40 }}
                onClick={() => handleSuspendre(user)}
                disabled={modifierStatutMutation.isPending}
                data-ocid={`admin.compte.suspendre_button.${idx + 1}`}
              >
                Suspendre
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Tab: Statistiques
function StatistiquesTab() {
  const { data: pharmacies = [], isLoading } = useAdminPharmacies();

  const stats = useMemo(() => {
    const totalValidees = pharmacies.filter(
      (p) => p.statutPharmacie === StatutPharmacie.validee,
    ).length;
    const totalEnAttente = pharmacies.filter(
      (p) => p.statutPharmacie === StatutPharmacie.enAttente,
    ).length;
    const totalSuspendues = pharmacies.filter(
      (p) => p.statutPharmacie === StatutPharmacie.suspendue,
    ).length;
    const totalVues = pharmacies.reduce((acc, p) => acc + p.nombreVues, 0n);
    return {
      totalValidees,
      totalEnAttente,
      totalSuspendues,
      totalVues,
      total: pharmacies.length,
    };
  }, [pharmacies]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total pharmacies",
      value: stats.total,
      icon: "🏥",
      color: "bg-primary/10 border-primary/20",
      textColor: "text-primary",
    },
    {
      label: "Pharmacies validées",
      value: stats.totalValidees,
      icon: "✅",
      color: "bg-success/10 border-success/20",
      textColor: "text-success",
    },
    {
      label: "En attente de validation",
      value: stats.totalEnAttente,
      icon: "⏳",
      color: "bg-warning/10 border-warning/20",
      textColor: "text-warning",
    },
    {
      label: "Pharmacies suspendues",
      value: stats.totalSuspendues,
      icon: "🚫",
      color: "bg-destructive/10 border-destructive/20",
      textColor: "text-destructive",
    },
    {
      label: "Total des vues cumulées",
      value: stats.totalVues.toString(),
      icon: "👁",
      color: "bg-secondary border-border",
      textColor: "text-foreground",
    },
  ];

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.color} border rounded-lg px-4 py-4 flex items-center gap-4`}
        >
          <span className="text-3xl flex-shrink-0">{card.icon}</span>
          <div>
            <p className={`text-2xl font-bold ${card.textColor}`}>
              {card.value.toString()}
            </p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminPage() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { isFetching } = useActor();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();

  useEffect(() => {
    if (!identity && !isFetching) {
      navigate({ to: "/" });
    }
  }, [identity, isFetching, navigate]);

  useEffect(() => {
    if (
      profile !== undefined &&
      profile !== null &&
      profile.role !== UserRole.admin
    ) {
      // Non-admin users are sent back to home — no admin route hint given
      navigate({ to: "/" });
    }
  }, [profile, navigate]);

  const handleLogout = () => {
    clear();
    navigate({ to: "/" });
  };

  if (profileLoading) {
    return (
      <Layout title="Administration" showBack backTo="/">
        <div
          className="px-4 py-6 space-y-4 max-w-lg mx-auto"
          data-ocid="admin.loading_state"
        >
          <Skeleton className="h-10 w-full" />
          <SkeletonList count={4} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Administration"
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
      <div className="px-4 py-4 max-w-lg mx-auto">
        <Tabs defaultValue="pharmacies" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4 h-11">
            <TabsTrigger value="pharmacies" data-ocid="admin.pharmacies_tab">
              Pharmacies
            </TabsTrigger>
            <TabsTrigger value="comptes" data-ocid="admin.comptes_tab">
              Comptes
            </TabsTrigger>
            <TabsTrigger value="stats" data-ocid="admin.stats_tab">
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pharmacies">
            <PharmaciesTab />
          </TabsContent>

          <TabsContent value="comptes">
            <ComptesTab />
          </TabsContent>

          <TabsContent value="stats">
            <StatistiquesTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
