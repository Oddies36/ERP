import { Navigate } from "react-router-dom";
import api from "../api/axiosConfig";
import React, { useState, useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await api.post("users/validate-token/", {
          token: token,
        });

        if (response.data.valid) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    if (token) {
      validateToken();
    } else {
      setIsAuthenticated(false);
    }
  }, [token]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
