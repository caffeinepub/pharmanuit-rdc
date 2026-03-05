import { Layout } from "../components/Layout";

const sections = [
  {
    num: 1,
    title: "Informations uniquement",
    content:
      "L'application PharmaNuit RDC fournit uniquement des informations sur les pharmacies. Elle n'est pas responsable de l'exactitude des données communiquées par les pharmacies.",
  },
  {
    num: 2,
    title: "Pas de vente de médicaments",
    content:
      "L'application ne vend aucun médicament et ne fait aucun intermédiaire commercial entre les utilisateurs et les pharmacies.",
  },
  {
    num: 3,
    title: "Horaires déclarés par les pharmacies",
    content:
      "Les horaires d'ouverture sont déclarés par les pharmacies elles-mêmes. PharmaNuit RDC ne garantit pas leur exactitude en temps réel. Il est conseillé d'appeler la pharmacie avant de vous déplacer.",
  },
  {
    num: 4,
    title: "Responsabilité de l'utilisateur",
    content:
      "Chaque utilisateur est responsable de ses déplacements et de ses décisions. PharmaNuit RDC ne peut être tenu responsable des désagréments liés à des informations incorrectes ou périmées.",
  },
  {
    num: 5,
    title: "Sécurité",
    content:
      "L'application ne garantit pas la sécurité des lieux listés. Nous recommandons aux utilisateurs de prendre les précautions nécessaires lors de leurs déplacements.",
  },
];

export function ConditionsPage() {
  return (
    <Layout title="Conditions d'utilisation" showBack backTo="/">
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="space-y-1 mb-6">
          <h2 className="text-xl font-bold text-foreground">
            Conditions d'utilisation
          </h2>
          <p className="text-sm text-muted-foreground">
            En utilisant PharmaNuit RDC, vous acceptez les conditions suivantes.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">
                    {section.num}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          Dernière mise à jour :{" "}
          {new Date().toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
          })}
        </p>
      </div>
    </Layout>
  );
}
