import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { UserRole } from "../backend.d";
import { Layout } from "../components/Layout";
import { PharmacyCard } from "../components/PharmacyCard";
import { SkeletonList } from "../components/SkeletonCard";
import { useActor } from "../hooks/useActor";
import { useAllPharmacies } from "../hooks/useQueries";

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

export function HomePage() {
  const [search, setSearch] = useState("");
  const [seeded, setSeeded] = useState(false);
  const { data: pharmacies = [], isLoading, refetch } = useAllPharmacies();
  const { actor, isFetching } = useActor();

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

  return (
    <Layout
      rightSlot={
        <Link
          to="/login"
          className="text-white/90 text-sm font-medium hover:text-white transition-colors whitespace-nowrap"
          data-ocid="nav.pharmacie_link"
        >
          Espace pharmacie
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
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
