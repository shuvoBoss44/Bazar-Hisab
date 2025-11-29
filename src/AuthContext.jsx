import { createContext, useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = "https://bazar-hisab-backend.onrender.com";

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/check-auth`, {
        withCredentials: true,
      });
      console.log(response);
      if (response.data?.data?.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(response.data.data.user);
      } else {
        throw new Error("Authentication check failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to verify authentication"
      );
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await axios.post(
        `${API_URL}/api/users/logout`,
        {},
        { withCredentials: true }
      );
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setError(err.response?.data?.message || "Logout failed");
    }
  }, [navigate]);

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      user,
      loading,
      error,
      setError,
      logout,
      checkAuth,
      setUser,
    }),
    [isAuthenticated, user, loading, error, logout, checkAuth]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
