import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StatutPharmacie } from "../backend.d";
import type { Pharmacie } from "../backend.d";
import { Layout } from "../components/Layout";
import { PharmacyCard } from "../components/PharmacyCard";
import { SkeletonList } from "../components/SkeletonCard";
import { useActor } from "../hooks/useActor";
import { useAllPharmacies } from "../hooks/useQueries";
import { COMMUNES_COORDS, distanceKm } from "../utils/communes";

const SAMPLE_PHARMACIES = [
  {
    nomPharmacie: "Pharmacie de la Paix",
    commune: "Gombe",
    adresse: "Av. des Aviateurs no 15",
    telephone: "+243810000001",
    horaires: "07h-22h",
    statutOuvert: true,
    valideParAdmin: true,
  },
  {
    nomPharmacie: "Pharmacie Centrale",
    commune: "Kinshasa",
    adresse: "Bld du 30 juin",
    telephone: "+243810000002",
    horaires: "08h-20h",
    statutOuvert: false,
    valideParAdmin: true,
  },
  {
    nomPharmacie: "Pharmacie Sainte Marie",
    commune: "Lingwala",
    adresse: "Rue Pumbu",
    telephone: "+243810000003",
    horaires: "24h/24",
    statutOuvert: true,
    valideParAdmin: true,
  },
  {
    nomPharmacie: "Pharmacie Espoir",
    commune: "Kalamu",
    adresse: "Av. Kasa-Vubu",
    telephone: "+243810000004",
    horaires: "07h-21h",
    statutOuvert: true,
    valideParAdmin: true,
  },
  {
    nomPharmacie: "Pharmacie du Marché",
    commune: "Ngaba",
    adresse: "Marché central",
    telephone: "+243810000005",
    horaires: "08h-18h",
    statutOuvert: false,
    valideParAdmin: true,
  },
];

interface UserCoords {
  lat: number;
  lon: number;
}

export function HomePage() {
  const [search, setSearch] = useState("");
  const [seeded, setSeeded] = useState(false);
  const { data: pharmacies = [], isLoading, refetch } = useAllPharmacies();
  const { actor, isFetching } = useActor();

  // Proximity state
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);
  const [proximityIndex, setProximityIndex] = useState(0);
  const [proximitySorted, setProximitySorted] = useState<Pharmacie[]>([]);
  const [geoError, setGeoError] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [proximityActive, setProximityActive] = useState(false);

  // Refs for scrolling to cards
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Seed sample data if empty
  useEffect(() => {
    if (seeded) return;
    if (isFetching || !actor) return;
    if (isLoading) return;
    if (pharmacies.length === 0) {
      setSeeded(true);
      const seedData = async () => {
        for (const p of SAMPLE_PHARMACIES) {
          try {
            await actor.ajoutParAdmin(
              p.nomPharmacie,
              p.commune,
              p.adresse,
              p.telephone,
              p.horaires,
              p.statutOuvert,
              p.valideParAdmin,
            );
          } catch {
            // ignore seed errors
          }
        }
        refetch();
      };
      seedData();
    } else {
      setSeeded(true);
    }
  }, [pharmacies.length, actor, isFetching, isLoading, seeded, refetch]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pharmacies;
    return pharmacies.filter(
      (p) =>
        p.commune.toLowerCase().includes(term) ||
        p.nomPharmacie.toLowerCase().includes(term),
    );
  }, [pharmacies, search]);

  // Sort validated pharmacies by distance from user
  function buildProximitySorted(coords: UserCoords): Pharmacie[] {
    const validated = pharmacies.filter(
      (p) => p.statutPharmacie === StatutPharmacie.validee,
    );

    return [...validated].sort((a, b) => {
      const coordsA = COMMUNES_COORDS[a.commune];
      const coordsB = COMMUNES_COORDS[b.commune];
      const distA = coordsA
        ? distanceKm(coords.lat, coords.lon, coordsA.lat, coordsA.lon)
        : Number.POSITIVE_INFINITY;
      const distB = coordsB
        ? distanceKm(coords.lat, coords.lon, coordsB.lat, coordsB.lon)
        : Number.POSITIVE_INFINITY;
      return distA - distB;
    });
  }

  // Scroll to the highlighted card
  function scrollToCard(pharmacyId: string) {
    setTimeout(() => {
      const el = cardRefs.current.get(pharmacyId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  }

  function handleProximity() {
    setGeoError("");

    if (!proximityActive || proximitySorted.length === 0) {
      // First press or not yet active: request geolocation
      if (userCoords) {
        // Already have coords — just activate
        const sorted = buildProximitySorted(userCoords);
        setProximitySorted(sorted);
        setProximityIndex(0);
        setProximityActive(true);
        if (sorted.length > 0) {
          scrollToCard(sorted[0].id.toString());
        }
        return;
      }

      if (!navigator.geolocation) {
        setGeoError(
          "La géolocalisation n'est pas supportée par ce navigateur.",
        );
        return;
      }

      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: UserCoords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserCoords(coords);
          const sorted = buildProximitySorted(coords);
          setProximitySorted(sorted);
          setProximityIndex(0);
          setProximityActive(true);
          setGeoLoading(false);
          if (sorted.length > 0) {
            scrollToCard(sorted[0].id.toString());
          }
        },
        () => {
          setGeoError(
            "Activez la localisation pour utiliser cette fonctionnalité.",
          );
          setGeoLoading(false);
        },
        { timeout: 10000, maximumAge: 60000 },
      );
    } else {
      // Already active: cycle to next pharmacy
      const nextIndex = (proximityIndex + 1) % proximitySorted.length;
      setProximityIndex(nextIndex);
      scrollToCard(proximitySorted[nextIndex].id.toString());
    }
  }

  // Current highlighted pharmacy
  const highlightedPharmacy =
    proximityActive && proximitySorted.length > 0
      ? proximitySorted[proximityIndex]
      : null;

  // Distance of highlighted pharmacy
  const highlightedDistance = useMemo(() => {
    if (!highlightedPharmacy || !userCoords) return null;
    const coords = COMMUNES_COORDS[highlightedPharmacy.commune];
    if (!coords) return null;
    return distanceKm(userCoords.lat, userCoords.lon, coords.lat, coords.lon);
  }, [highlightedPharmacy, userCoords]);

  return (
    <Layout
      rightSlot={
        <Link
          to="/pharmacien-login"
          className="text-white/90 text-sm font-medium hover:text-white transition-colors whitespace-nowrap"
          data-ocid="nav.pharmacie_link"
        >
          Espace Pharmacien
        </Link>
      }
    >
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <Input
            type="search"
            placeholder="Rechercher par commune ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base bg-card"
            data-ocid="home.search_input"
            autoComplete="off"
          />
        </div>

        {/* Proximity button */}
        <div className="space-y-1.5">
          <Button
            type="button"
            variant={proximityActive ? "default" : "outline"}
            className={`w-full h-11 gap-2 font-semibold text-sm transition-all ${
              proximityActive
                ? "bg-primary text-primary-foreground"
                : "border-primary text-primary hover:bg-primary/10"
            }`}
            onClick={handleProximity}
            disabled={geoLoading || isLoading}
            data-ocid="home.proximity_button"
          >
            {geoLoading ? (
              <>
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Localisation en cours…
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                {proximityActive
                  ? `Pharmacie suivante (${proximityIndex + 1}/${proximitySorted.length})`
                  : "Pharmacies à proximité"}
              </>
            )}
          </Button>

          {geoError && (
            <p
              className="text-xs text-destructive flex items-center gap-1 px-1"
              data-ocid="home.proximity_error_state"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {geoError}
            </p>
          )}

          {proximityActive && proximitySorted.length > 0 && !geoError && (
            <p
              className="text-xs text-primary flex items-center gap-1 px-1 font-medium"
              data-ocid="home.proximity_success_state"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              {highlightedPharmacy?.nomPharmacie}
              {highlightedDistance !== null && (
                <span className="text-muted-foreground font-normal">
                  &nbsp;— ~
                  {highlightedDistance < 1
                    ? "<1"
                    : Math.round(highlightedDistance)}{" "}
                  km de vous
                </span>
              )}
            </p>
          )}
        </div>

        {/* Info strip */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {isLoading
              ? "Chargement..."
              : `${filtered.length} pharmacie${filtered.length !== 1 ? "s" : ""} trouvée${filtered.length !== 1 ? "s" : ""}`}
          </span>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-primary underline text-xs"
            >
              Effacer
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-3" data-ocid="home.pharmacy_list">
          {isLoading ? (
            <SkeletonList count={5} data-ocid="home.loading_state" />
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="home.empty_state"
            >
              <svg
                className="mx-auto mb-3 text-muted-foreground/40"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <p className="font-medium">Aucune pharmacie trouvée</p>
              {search && (
                <p className="text-sm mt-1">
                  Essayez un autre terme de recherche.
                </p>
              )}
            </div>
          ) : (
            filtered.map((pharmacy, idx) => (
              <PharmacyCard
                key={pharmacy.id.toString()}
                pharmacy={pharmacy}
                index={idx + 1}
                isHighlighted={highlightedPharmacy?.id === pharmacy.id}
                distanceKm={
                  highlightedPharmacy?.id === pharmacy.id
                    ? highlightedDistance
                    : undefined
                }
                cardRef={(el) => {
                  if (el) {
                    cardRefs.current.set(pharmacy.id.toString(), el);
                  } else {
                    cardRefs.current.delete(pharmacy.id.toString());
                  }
                }}
              />
            ))
          )}
        </div>

        {/* Register link for regular users */}
        <p className="text-center text-xs text-muted-foreground pb-2">
          Vous souhaitez créer un compte ?{" "}
          <Link
            to="/inscription"
            className="text-primary font-semibold underline"
            data-ocid="home.register_link"
          >
            S'inscrire
          </Link>
        </p>
      </div>
    </Layout>
  );
}
