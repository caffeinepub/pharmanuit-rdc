import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserRole } from "../backend.d";
import { Layout } from "../components/Layout";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const navigate = useNavigate();
  const {
    login,
    isLoggingIn,
    isLoginError,
    loginError,
    identity,
    isInitializing,
  } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // After identity loaded, get profile and redirect
  useEffect(() => {
    if (!identity || !actor || isFetching || isRedirecting) return;

    setIsRedirecting(true);
    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (!profile) {
          navigate({ to: "/" });
          return;
        }
        if (profile.role === UserRole.admin) {
          navigate({ to: "/admin" });
        } else if (profile.role === UserRole.pharmacy) {
          navigate({ to: "/pharmacie-dashboard" });
        } else {
          navigate({ to: "/" });
        }
      })
      .catch(() => {
        // No profile yet, try to redirect based on what we know
        navigate({ to: "/" });
      })
      .finally(() => {
        setIsRedirecting(false);
      });
  }, [identity, actor, isFetching, navigate, isRedirecting]);

  useEffect(() => {
    if (isLoginError && loginError) {
      setErrorMsg(loginError.message || "Erreur de connexion");
    }
  }, [isLoginError, loginError]);

  const handleLogin = () => {
    setErrorMsg(null);
    login();
  };

  return (
    <Layout title="Connexion" showBack backTo="/">
      <div className="px-4 py-8 max-w-sm mx-auto space-y-6">
        <div className="text-center space-y-1">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Espace pharmacie / admin
          </h2>
          <p className="text-sm text-muted-foreground">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>

        {errorMsg && (
          <div
            className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive"
            data-ocid="login.error_state"
          >
            {errorMsg}
          </div>
        )}

        {(isRedirecting || (identity && isFetching)) && (
          <div
            className="bg-secondary rounded-lg px-4 py-3 text-sm text-muted-foreground text-center"
            data-ocid="login.loading_state"
          >
            Redirection en cours...
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn || isInitializing || isRedirecting}
            className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground"
            data-ocid="login.submit_button"
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
              <span className="flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Se connecter
              </span>
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-2">
          Vous êtes une nouvelle pharmacie ?{" "}
          <Link
            to="/inscription"
            className="text-primary font-semibold underline"
            data-ocid="login.inscription_link"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </Layout>
  );
}
