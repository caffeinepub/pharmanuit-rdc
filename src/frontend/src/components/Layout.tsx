import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
  rightSlot?: ReactNode;
}

export function Layout({
  children,
  title,
  showBack = false,
  backTo = "/",
  rightSlot,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="pharma-header sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3 px-4 h-14">
          {showBack ? (
            <Link
              to={backTo}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors flex-shrink-0"
              aria-label="Retour"
              data-ocid="nav.link"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-2 text-white no-underline"
              data-ocid="nav.link"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </Link>
          )}
          <h1 className="text-white font-bold text-lg flex-1 truncate">
            {title ?? "PharmaNuit RDC"}
          </h1>
          {rightSlot}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-card py-4 px-4 text-center text-xs text-muted-foreground">
        <div className="space-y-1">
          <div>
            <Link
              to="/conditions"
              className="underline text-primary"
              data-ocid="footer.conditions_link"
            >
              Conditions d'utilisation
            </Link>
          </div>
          <div>
            © {new Date().getFullYear()}. Conçu avec ❤️ via{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
