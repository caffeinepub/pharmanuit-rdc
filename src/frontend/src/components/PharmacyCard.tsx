import { Link } from "@tanstack/react-router";
import type { Pharmacie } from "../backend.d";
import { StatutPharmacie } from "../backend.d";

interface PharmacyCardProps {
  pharmacy: Pharmacie;
  index: number;
  showAdmin?: boolean;
  onValider?: () => void;
  onSuspendre?: () => void;
  onModifier?: () => void;
  onSupprimer?: () => void;
  isPendingAction?: boolean;
}

export function PharmacyCard({
  pharmacy,
  index,
  showAdmin = false,
  onValider,
  onSuspendre,
  onModifier,
  onSupprimer,
  isPendingAction = false,
}: PharmacyCardProps) {
  const ocid = `home.pharmacy.item.${index}`;

  if (showAdmin) {
    const statut = pharmacy.statutPharmacie;
    const isValidee = statut === StatutPharmacie.validee;
    const isEnAttente = statut === StatutPharmacie.enAttente;
    const isSuspendue = statut === StatutPharmacie.suspendue;

    let statusLabel = "En attente";
    let statusClass = "badge-attente";
    if (isValidee) {
      statusLabel = "Validé";
      statusClass = "badge-valide";
    } else if (isSuspendue) {
      statusLabel = "Suspendu";
      statusClass = "badge-suspendu";
    }

    return (
      <div
        className="bg-card border border-border rounded-lg p-4 space-y-3"
        data-ocid={`admin.pharmacy.item.${index}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {pharmacy.nomPharmacie}
            </p>
            <p className="text-sm text-muted-foreground">{pharmacy.commune}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pharmacy.adresse}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass}`}
            >
              {statusLabel}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                pharmacy.statutOuvert ? "badge-ouvert" : "badge-ferme"
              }`}
            >
              {pharmacy.statutOuvert ? "Ouvert" : "Fermé"}
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          👁 {pharmacy.nombreVues.toString()} vue
          {pharmacy.nombreVues === 1n ? "" : "s"}
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isValidee && (
            <button
              type="button"
              className="action-btn bg-primary text-primary-foreground text-sm px-4 py-2 flex-1"
              style={{ minHeight: 40 }}
              onClick={onValider}
              disabled={isPendingAction}
              data-ocid={`admin.pharmacy.valider_button.${index}`}
            >
              Valider
            </button>
          )}
          {isValidee && (
            <button
              type="button"
              className="action-btn bg-destructive text-destructive-foreground text-sm px-4 py-2 flex-1"
              style={{ minHeight: 40 }}
              onClick={onSuspendre}
              disabled={isPendingAction}
              data-ocid={`admin.pharmacy.suspendre_button.${index}`}
            >
              Suspendre
            </button>
          )}
          {isEnAttente && (
            <button
              type="button"
              className="action-btn bg-destructive/90 text-destructive-foreground text-sm px-4 py-2 flex-1"
              style={{ minHeight: 40 }}
              onClick={onSuspendre}
              disabled={isPendingAction}
              data-ocid={`admin.pharmacy.suspendre_button.${index}`}
            >
              Refuser
            </button>
          )}
          <button
            type="button"
            className="action-btn bg-secondary text-secondary-foreground text-sm px-4 py-2 flex-1"
            style={{ minHeight: 40 }}
            onClick={onModifier}
            disabled={isPendingAction}
            data-ocid={`admin.pharmacy.modifier_button.${index}`}
          >
            Modifier
          </button>
          <button
            type="button"
            className="action-btn bg-destructive text-destructive-foreground text-sm px-4 py-2 flex-1"
            style={{ minHeight: 40 }}
            onClick={onSupprimer}
            disabled={isPendingAction}
            data-ocid={`admin.pharmacy.delete_button.${index}`}
          >
            Supprimer
          </button>
        </div>
      </div>
    );
  }

  return (
    <Link
      to="/pharmacie/$id"
      params={{ id: pharmacy.id.toString() }}
      className="block pharmacy-card no-underline"
      data-ocid={ocid}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate text-base">
            {pharmacy.nomPharmacie}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pharmacy.commune}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0 ${
            pharmacy.statutOuvert ? "badge-ouvert" : "badge-ferme"
          }`}
        >
          {pharmacy.statutOuvert ? "Ouvert" : "Fermé"}
        </span>
      </div>
    </Link>
  );
}
