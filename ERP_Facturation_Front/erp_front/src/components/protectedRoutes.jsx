import { Navigate } from "react-router-dom";
import api from "../api/axiosConfig";
import React, { useState, useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    
    const validateAndRefreshToken = async () => {
      try {
        //Valider le token
        const response = await api.post("users/validate-token/", {
          token: accessToken,
        });
        //Si la réponse contient valid = true, le isAuthenticated se met également sur true
        if (response.data.valid) {
          setIsAuthenticated(true);
        } else {
          throw new Error("Token expiré");
        }
      } catch (error) {
        //En erreur, vérifie si le refreshToken est true
        if (refreshToken) {
          try {
            //Si le refresh token est true, on envoi une demande pour demander le refresh
            const refreshResponse = await api.post("api/token/refresh/", {
              refresh: refreshToken,
            });
    
            //Si le refresh est encore valid, on stock le nouveau access
            localStorage.setItem("accessToken", refreshResponse.data.access);
            setIsAuthenticated(true);
          } catch (refreshError) {
            //Si le refresh token a expiré aussi, il faut se reconnecter
            console.error("Refresh token expiré:", refreshError);
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      }
    };

    if (accessToken) {
      validateAndRefreshToken();
    } else {
      setIsAuthenticated(false);
    }
  }, [accessToken, refreshToken]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;