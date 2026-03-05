import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserRole } from "../backend.d";
import { Layout } from "../components/Layout";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function AdminLoginPage() {
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
  const [accessDenied, setAccessDenied] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // After identity loaded, verify admin role
  useEffect(() => {
    if (!identity || !actor || isFetching) return;
    if (isRedirecting) return;
    if (hasChecked) return;

    setHasChecked(true);
    setIsRedirecting(true);

    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (profile && profile.role === UserRole.admin) {
          navigate({ to: "/admin" });
        } else {
          // Not admin — show generic access denied, no admin hint
          setAccessDenied(true);
          setIsRedirecting(false);
        }
      })
      .catch(() => {
        setAccessDenied(true);
        setIsRedirecting(false);
      });
  }, [identity, actor, isFetching, navigate, isRedirecting, hasChecked]);

  useEffect(() => {
    if (isLoginError && loginError) {
      if (
        loginError.message?.toLowerCase().includes("already authenticated") ||
        loginError.message?.toLowerCase().includes("already logged in")
      ) {
        return;
      }
      setAccessDenied(true);
    }
  }, [isLoginError, loginError]);

  const handleLogin = () => {
    setAccessDenied(false);
    setHasChecked(false);
    login();
  };

  return (
    <Layout title="Connexion sécurisée" showBack={false}>
      <div className="px-4 py-8 max-w-sm mx-auto space-y-6">
        <div className="text-center space-y-1">
          <div className="w-16 h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Connexion sécurisée
          </h2>
          <p className="text-sm text-muted-foreground">
            Accès restreint — vérification d'identité requise
          </p>
        </div>

        {accessDenied && (
          <div
            className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive text-center"
            data-ocid="admin-login.error_state"
          >
            Accès non autorisé.
          </div>
        )}

        {(isRedirecting || (identity && isFetching && !accessDenied)) && (
          <div
            className="bg-secondary rounded-lg px-4 py-3 text-sm text-muted-foreground text-center"
            data-ocid="admin-login.loading_state"
          >
            Vérification en cours...
          </div>
        )}

        {!isRedirecting && (
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn || isInitializing || isRedirecting}
            className="w-full h-14 text-base font-semibold"
            data-ocid="admin-login.submit_button"
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
                Vérification...
              </span>
            ) : (
              "Se connecter"
            )}
          </Button>
        )}
      </div>
    </Layout>
  );
}
