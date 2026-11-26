import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadProfile = useCallback(async (uid) => {
    if (!uid) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    setProfile(data || null);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        setSession(data.session);
        await loadProfile(data.session?.user?.id);
      })
      .catch((err) => setAuthError(err.message))
      .finally(() => {
        if (active) setIsLoadingAuth(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      // Don't call Supabase directly inside this callback; defer it.
      setTimeout(() => loadProfile(next?.user?.id), 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo(() => {
    const user = session?.user || null;
    const role = profile?.role || (user ? "tenant" : null);
    return {
      user,
      profile,
      role,
      isAuthenticated: Boolean(user),
      isBroker: role === "broker",
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      setAuthError,
      refreshProfile: () => loadProfile(user?.id),
      navigateToLogin: () => {
        window.location.href = "/login";
      },
      logout: async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      },
    };
  }, [session, profile, isLoadingAuth, authError, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
