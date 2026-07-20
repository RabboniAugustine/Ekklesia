import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getCurrentSession,
  getUserProfile,
  signOut as signOutRequest,
  type UserProfile,
} from "../services/authService";

type AuthContextValue = {
  profile: UserProfile | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setLoading(true);
      setError("");

      const session = await getCurrentSession();

      if (!session?.user) {
        setProfile(null);
        return;
      }

      const userProfile = await getUserProfile(session.user.id);

      if (!userProfile.is_active) {
        await signOutRequest();
        setProfile(null);
        setError("Your account has been deactivated. Contact your church admin.");
        return;
      }

      setProfile(userProfile);
    } catch (err) {
      console.error(err);
      setProfile(null);
      setError("Could not load your profile. Please sign in again.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await signOutRequest();
    setProfile(null);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ profile, loading, error, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
