import { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = "https://bazar-hisab-backend.onrender.com";

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/check-auth`, {
        withCredentials: true,
      });
      if (response.data?.data?.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(response.data.data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error("Authentication check failed:", err);
      setIsAuthenticated(false);
      setUser(null);
      setError(
        err.response?.data?.message || "Failed to verify authentication"
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
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
  };

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
    [isAuthenticated, user, loading, error]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
