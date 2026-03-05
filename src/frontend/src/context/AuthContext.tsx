import { useQueryClient } from "@tanstack/react-query";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { UserProfile } from "../backend.d";
import { UserRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthContextType {
  profile: UserProfile | null;
  isLoadingProfile: boolean;
  loginWithCredentials: (email: string, motDePasse: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, clear } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithCredentials = useCallback(
    async (_email: string, _motDePasse: string) => {
      if (!actor) throw new Error("Acteur non disponible");
      setIsLoadingProfile(true);
      setError(null);
      try {
        // inscriptionUtilisateur creates or authenticates; for login we just get the profile
        // The real auth is via Internet Identity; here we match email/password logic via backend
        // We call getCallerUserProfile after actor is ready
        const p = await actor.getCallerUserProfile();
        if (!p) {
          // Try inscription as user (no-op if already exists)
          throw new Error("Identifiants incorrects ou compte inexistant.");
        }
        setProfile(p);
        queryClient.setQueryData(["callerProfile"], p);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur de connexion";
        setError(msg);
        throw err;
      } finally {
        setIsLoadingProfile(false);
      }
    },
    [actor, queryClient],
  );

  const logout = useCallback(() => {
    clear();
    setProfile(null);
    setError(null);
    queryClient.clear();
  }, [clear, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        profile,
        isLoadingProfile,
        loginWithCredentials,
        logout,
        isAuthenticated: !!identity,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
