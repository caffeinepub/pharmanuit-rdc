import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { usePharmacyById } from "../hooks/useQueries";
import { recordCall } from "../utils/callTracking";

function ActionButton({
  icon,
  label,
  href,
  onClick,
  className = "",
  "data-ocid": dataOcid,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  "data-ocid"?: string;
}) {
  const baseClass = `action-btn ${className}`;
  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={baseClass}
        data-ocid={dataOcid}
      >
        {icon}
        {label}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={baseClass}
      data-ocid={dataOcid}
    >
      {icon}
      {label}
    </button>
  );
}

export function PharmacyDetailPage() {
  const { id } = useParams({ from: "/pharmacie/$id" });
  const pharmacyId = BigInt(id);
  const { data: pharmacy, isLoading } = usePharmacyById(pharmacyId);

  const [showNumero, setShowNumero] = useState(false);
  const [showAdresse, setShowAdresse] = useState(false);

  if (isLoading) {
    return (
      <Layout title="Détail pharmacie" showBack backTo="/">
        <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-1/3" />
          <div className="space-y-3 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!pharmacy) {
    return (
      <Layout title="Pharmacie introuvable" showBack backTo="/">
        <div
          className="px-4 py-12 text-center text-muted-foreground max-w-lg mx-auto"
          data-ocid="pharmacy_detail.error_state"
        >
          <p className="font-medium">
            Cette pharmacie n'existe pas ou n'est plus disponible.
          </p>
        </div>
      </Layout>
    );
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${pharmacy.adresse}, ${pharmacy.commune}, RDC`,
  )}`;

  return (
    <Layout title={pharmacy.nomPharmacie} showBack backTo="/">
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Status header */}
        <div className="flex items-center gap-3">
          <span
            className={`text-sm px-3 py-1.5 rounded-full font-semibold ${
              pharmacy.statutOuvert ? "badge-ouvert" : "badge-ferme"
            }`}
          >
            {pharmacy.statutOuvert ? "● Ouvert" : "● Fermé"}
          </span>
          <span className="text-muted-foreground text-sm">
            {pharmacy.commune}
          </span>
        </div>

        {/* Horaires */}
        <div className="bg-secondary rounded-lg px-4 py-3 flex items-center gap-3">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary flex-shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <p className="text-xs text-muted-foreground">Horaires</p>
            <p className="font-semibold text-foreground">{pharmacy.horaires}</p>
          </div>
        </div>

        {/* Revealed panels */}
        {showNumero && (
          <div className="bg-secondary rounded-lg px-4 py-3 border-l-4 border-primary">
            <p className="text-xs text-muted-foreground mb-0.5">
              Numéro de téléphone
            </p>
            <p className="font-bold text-xl text-foreground tracking-wide">
              {pharmacy.telephone}
            </p>
          </div>
        )}

        {showAdresse && (
          <div className="bg-secondary rounded-lg px-4 py-3 border-l-4 border-primary">
            <p className="text-xs text-muted-foreground mb-0.5">Adresse</p>
            <p className="font-semibold text-foreground">{pharmacy.adresse}</p>
            <p className="text-sm text-muted-foreground">{pharmacy.commune}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          <ActionButton
            onClick={() => {
              recordCall(pharmacyId);
              window.location.href = `tel:${pharmacy.telephone}`;
            }}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.64 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            }
            label="Appeler"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="pharmacy_detail.appeler_button"
          />

          <ActionButton
            onClick={() => setShowNumero((v) => !v)}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
            label={showNumero ? "Masquer le numéro" : "Voir le numéro"}
            className="bg-secondary text-secondary-foreground hover:bg-accent"
            data-ocid="pharmacy_detail.voir_numero_button"
          />

          <ActionButton
            onClick={() => setShowAdresse((v) => !v)}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
            label={showAdresse ? "Masquer l'adresse" : "Voir l'adresse"}
            className="bg-secondary text-secondary-foreground hover:bg-accent"
            data-ocid="pharmacy_detail.voir_adresse_button"
          />

          <ActionButton
            href={mapsUrl}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
            }
            label="Itinéraire"
            className="bg-accent text-accent-foreground hover:bg-accent/80"
            data-ocid="pharmacy_detail.itineraire_button"
          />
        </div>
      </div>
    </Layout>
  );
}
