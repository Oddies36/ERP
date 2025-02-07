import React, { useState } from "react";
import api from "../../api/axiosConfig";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/token/", {
        username: credentials.username,
        password: credentials.password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      console.log("Login ok: ", response.data);
      setError("");
      navigate("/home");
    } catch (err) {
      console.error("login error: ", err);
      setError("Nom d'utilisateur ou mot de passe incorrect.");
      setCredentials({ username: "", password: "" });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Container maxWidth="xs">
        <Card
          elevation={3}
          sx={{
            padding: "2rem",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <Box sx={{ marginBottom: "1.5rem" }}>
            <img
              src="/images/logo.jpg"
              alt="ERP Logo"
              style={{
                maxWidth: "150px",
                height: "auto",
              }}
            />
          </Box>

          <Typography variant="h5" sx={{ marginBottom: "1rem", fontWeight: 600 }}>
            Système ERP
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ marginBottom: "2rem" }}
          >
            Connectez vous pour continuer
          </Typography>

          {error && (
            <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleLogin}>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                fullWidth
                label="Email ou user"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{

                fontWeight: "bold",
                marginBottom: "1em"
              }}
            >
              Connexion
            </Button>
          </form>
          
          <Box
              fullWidth
              display="flex"
              justifyContent={"space-between"}
              sx={{ marginBottom: 2 }}
            >
              <Typography
                component={Link}
                to="/creation-user"
                sx={{
                  textAlign: "left",
                }}
              >
                Créer un compte
              </Typography>
              <Typography
                sx={{
                  textAlign: "right",
                }}
              >
                Mot de passe oublié
              </Typography>
            </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
