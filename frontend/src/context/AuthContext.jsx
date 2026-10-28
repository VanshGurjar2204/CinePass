import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("cinepass_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("cinepass_token") || null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("cinepass_token");
      localStorage.removeItem("cinepass_user");
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("cinepass_token");
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data.success) {
            setUser(res.data.data.user);
            localStorage.setItem("cinepass_user", JSON.stringify(res.data.data.user));
          }
        } catch {
          // Token invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      const { user: userData, accessToken } = res.data.data;
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem("cinepass_token", accessToken);
      localStorage.setItem("cinepass_user", JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data.message || "Login failed");
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    if (res.data.success) {
      const { user: userData, accessToken } = res.data.data;
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem("cinepass_token", accessToken);
      localStorage.setItem("cinepass_user", JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data.message || "Registration failed");
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

