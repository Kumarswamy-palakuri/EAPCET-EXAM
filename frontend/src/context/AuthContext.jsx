import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginWithGoogle, logoutUser } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data.user);
    } catch {
      localStorage.removeItem("eamcet_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const signInWithGoogle = async (credential) => {
    const data = await loginWithGoogle(credential);
    localStorage.setItem("eamcet_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore API logout failure and clear local session anyway.
    } finally {
      localStorage.removeItem("eamcet_token");
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      signInWithGoogle,
      logout,
      refreshUser: bootstrap,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
